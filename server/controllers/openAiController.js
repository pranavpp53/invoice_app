import fs from 'node:fs/promises';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import upload, { deleteFile } from '../utils/multerConfig.js';
import InvoiceData from '../models/invoiceData.js';
import mongoose from 'mongoose';
import Document from '../models/document.js';
import Customer from '../models/customer.js';
import path, { dirname } from 'path';
import pdf2img from 'pdf-poppler';
import { fileURLToPath } from 'url';
import { log } from 'node:console';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

//generate title
const generateDocumentName = async () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const prefix = `DOC${day}/${month}/${year}`;

    try {
        const latestDocument = await Document.findOne({
            title: {
                $regex: `^${prefix}-\\d{4}$` // Matches exactly 4 digits after prefix-
            }
        }).sort({ title: -1 });

        let nextNumber = 1; // Default start from 0001

        if (latestDocument) {
            const matches = latestDocument.title.match(/-(\d{4})$/);
            if (matches && matches[1]) {
                const lastNumber = parseInt(matches[1]);
                if (!isNaN(lastNumber) && lastNumber >= 0 && lastNumber < 10000) {
                    nextNumber = lastNumber + 1;
                }
            }
        }

        return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating document name:', error);
        return `${prefix}-0001`; // Fallback to first number if error occurs
    }
};

//get document title api call
export const getUniqueDocumentName = async (req, res) => {
    try {
        const documentName = await generateDocumentName();
        return res.status(200).json(documentName);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to generate document name.' });
    }
};

//check duplicate invoice
const checkDuplicateInvoices = async (invoiceDate, invoiceNumber, companyName) => {
    try {

        const duplicateInvoices = await InvoiceData.find({
            invoiceDate: invoiceDate,
            invoiceNumber: invoiceNumber,
            companyName: companyName
        });
        return duplicateInvoices;
    } catch (error) {
        console.error('Error checking duplicate invoices:', error);
        throw error;
    }
};

const convertPdfToImage = async (uploadedFilePath) => {
    try {
      // Convert the first page of PDF to PNG using pdf-poppler
      const opts = {
        format: 'png',  // Convert to PNG initially
        out_dir: path.join(process.cwd(), 'uploads'),
        out_prefix: path.basename(uploadedFilePath, '.pdf'),
        page: 1,
      };
  
      await pdf2img.convert(uploadedFilePath, opts);
  
      // Path of the converted PNG image
      const pngFilePath = `${opts.out_dir}/${opts.out_prefix}-1.png`;
  
      // Use Sharp to convert the PNG to JPEG
      const jpegFilePath = `${opts.out_dir}/${opts.out_prefix}-1.jpg`;
      await sharp(pngFilePath)
        .jpeg({ quality: 80 }) // Optional: adjust quality
        .toFile(jpegFilePath);
  
      // Clean up: delete the original PNG and PDF
      await deleteFile(uploadedFilePath);
      await deleteFile(pngFilePath);
  
      return jpegFilePath; // Return the final JPEG path
    } catch (error) {
      console.error('Error during PDF to Image conversion:', error);
      throw new Error('PDF conversion failed');
    }
  };


//invoice data fetch
export const invoiceDataFetchByImage = async (req, res) => {

    const uploadSingle = upload.single('image');


    uploadSingle(req, res, async (err) => {

        const checkDocument = req.body.documentType;
        // Handle non-image document types directly
        if (checkDocument === 'sales') {
            try {
                const {
                    documentId,
                    customerId,
                    title,
                    description,
                    invoiceNumber,
                    trnNumber,
                    totalAmount,
                    vatTotal,
                    companyName,
                    invoiceDate,
                    grossAmount
                } = req.body;

                const userId = req.user.userId;

                let actualCustomerId = customerId;

                if (!customerId) {
                    const customer = await Customer.findOne({ userId });
                    if (!customer) {
                        throw new Error('Customer not found for the given userId');
                    }
                    actualCustomerId = customer._id;
                }

                if (!title) {
                    return res.status(400).json({ error: 'Title is required' });
                }

                if (documentId) {
                    const currentDocument = await Document.findById(documentId);
                    if (!currentDocument) {
                        return res.status(404).json({ message: "Document not found" });
                    }

                    const newInvoiceData = new InvoiceData({
                        documentId,
                        invoiceNumber: invoiceNumber || 'N/A',
                        trnNumber: trnNumber || 'N/A',
                        totalAmount: parseFloat(totalAmount) || 0,
                        vatTotal: parseFloat(vatTotal) || 0,
                        companyName: companyName || 'Unknown',
                        invoiceDate: invoiceDate || 'N/A',
                        grossAmount: parseFloat(grossAmount) || 0,
                        billType: checkDocument,
                        StatusUpdatedBy: userId,
                        customerId:actualCustomerId
                    });

                    await newInvoiceData.save();
                    return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });
                } else {
                    const existingTitle = await Document.findOne({ title });
                    if (existingTitle) {
                        return res.status(400).json({ error: 'Document title already exists' });
                    }

                    const newDocument = new Document({
                        documentNumber: title,
                        title,
                        description,
                        documentType: checkDocument,
                        customerId: actualCustomerId,
                        uploadedBy: userId,
                        updatedBy: userId,
                        StatusUpdatedBy: userId,
                    });

                    const savedDocument = await newDocument.save();
                    const newDocumentId = savedDocument._id;

                    const newInvoiceData = new InvoiceData({
                        documentId: newDocumentId,
                        invoiceNumber: invoiceNumber || 'N/A',
                        trnNumber: trnNumber || 'N/A',
                        totalAmount: parseFloat(totalAmount) || 0,
                        vatTotal: parseFloat(vatTotal) || 0,
                        companyName: companyName || 'Unknown',
                        invoiceDate: invoiceDate || 'N/A',
                        grossAmount: parseFloat(grossAmount) || 0,
                        billType: checkDocument,
                        StatusUpdatedBy: userId,
                        customerId:actualCustomerId
                    });

                    await newInvoiceData.save();
                    return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });
                }
            } catch (error) {
                console.error('Error processing document:', error);
                return res.status(500).json({ error: 'Error processing document', message: error.message });
            }
            return;
        }

        //for purchase and expense

        if (err) {
            return res.status(400).json({ error: 'File upload error', message: err.message });
        }
        if (!req.body.title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            let uploadedFilePath = req.file.path;
            let fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';

            if (fileType === 'pdf') {
                uploadedFilePath = await convertPdfToImage(uploadedFilePath);
              }

            // Read the uploaded file into a buffer
            const fileUrl = `/uploads/${path.basename(uploadedFilePath)}`;
            console.log("documnet type", checkDocument);


            if (checkDocument === 'legalDocuments' || checkDocument === 'otherDocuments') {
                try {
                    const { documentId, customerId, title, description } = req.body;

                    const userId = req.user.userId;

                    let actualCustomerId = customerId;

                    if (!customerId) {
                        const customer = await Customer.findOne({ userId });
                        if (!customer) {
                            throw new Error('Customer not found for the given userId');
                        }
                        actualCustomerId = customer._id;
                    }

                    if (!title) {
                        return res.status(400).json({ error: 'Title is required' });
                    }

                    if (documentId) {
                        const currentDocument = await Document.findById(documentId);
                        if (!currentDocument) {
                            return res.status(404).json({ message: "Document not found" });
                        }

                        const newInvoiceData = new InvoiceData({
                            documentId,
                            invoiceNumber: 'N/A',
                            trnNumber: 'N/A',
                            totalAmount: 0,
                            vatTotal: 0,
                            companyName: 'Unknown',
                            invoiceDate: 'N/A',
                            grossAmount: 0,
                            billType: checkDocument,
                            StatusUpdatedBy: userId,
                            imageUrl: fileUrl,
                            fileType: fileType,
                            customerId:actualCustomerId
                        });

                        await newInvoiceData.save();
                        return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });
                    } else {
                        const existingTitle = await Document.findOne({ title });
                        if (existingTitle) {
                            return res.status(400).json({ error: 'Document title already exists' });
                        }

                        const newDocument = new Document({
                            documentNumber: title,
                            title,
                            description,
                            documentType: checkDocument,
                            customerId: actualCustomerId,
                            uploadedBy: userId,
                            updatedBy: userId,
                            StatusUpdatedBy: userId,
                        });

                        const savedDocument = await newDocument.save();
                        const newDocumentId = savedDocument._id;

                        const newInvoiceData = new InvoiceData({
                            documentId: newDocumentId,
                            invoiceNumber: 'N/A',
                            trnNumber: 'N/A',
                            totalAmount: 0,
                            vatTotal: 0,
                            companyName: 'Unknown',
                            invoiceDate: 'N/A',
                            grossAmount: 0,
                            billType: checkDocument,
                            StatusUpdatedBy: userId,
                            imageUrl: fileUrl,
                            fileType: fileType,
                            customerId:actualCustomerId
                        });

                        await newInvoiceData.save();
                        return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });
                    }
                } catch (error) {
                    console.error('Error processing document:', error);
                    return res.status(500).json({ error: 'Error processing document', message: error.message });
                }
            }

            const imageBuffer = await fs.readFile(uploadedFilePath);
            const base64Image = imageBuffer.toString('base64');

            const openaiResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in extracting specific information from invoice images and PDFs. Your task is to accurately identify and extract key details from the given invoice file. Always respond with only a valid JSON object, without any markdown formatting or explanation."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze the invoice and extract these specific fields:

1. invoiceNumber: Look for "Invoice No." or similar. It should be a numeric value.
2. TRNnumber: This is the Tax Registration Number, often prefixed with "TRN" or found near "TAX INVOICE". It's typically a long numeric string.
3. totalAmount: This is the final amount to be paid. Look for "Net Total", "Total Amount", or the last/largest amount on the invoice.
4. VATtotal: This is the total VAT or tax amount. Look for "VAT Amount", "Tax Amount", or calculate it from the VAT rate if provided.
5. companyName: This is typically the most prominent name at the top of the invoice.
6. invoiceDate: Look for a date associated with the invoice, often near the top or labeled as "Invoice Date" or "Date".Ensure the date is extracted only in numeric format (dd-mm-yyyy). If the date is presented in a different format (e.g., 'Oct 22, 2024'), convert it to ddmmyyyy.
7. grossAmount: This is the total amount before tax. Look for "Subtotal", "Net Amount", or calculate it by subtracting VAT from the total amount.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    },
                ],
                max_tokens: 300,
            });

            const { documentId, customerId, documentType, title, description, paymentMode } = req.body;

            const userId = req.user.userId;

            let actualCustomerId = customerId;

            if (!customerId) {
                const customer = await Customer.findOne({ userId });

                if (!customer) {
                    throw new Error('Customer not found for the given userId');
                }

                actualCustomerId = customer._id;
            }

            console.log('Raw OpenAI response:', openaiResponse.choices[0].message.content);

            let analysisResult;
            try {
                let cleanedContent = openaiResponse.choices[0].message.content.trim();
                if (cleanedContent.startsWith('```json')) {
                    cleanedContent = cleanedContent.replace(/^```json\n/, '').replace(/\n```$/, '');
                }
                analysisResult = JSON.parse(cleanedContent);
            } catch (parseError) {
                console.error('Error parsing OpenAI response:', parseError);
                return res.status(500).json({ error: 'Error parsing AI response', message: parseError.message });
            }

            if (analysisResult) {
                const cleanNumber = (value) => {
                    if (typeof value === 'string') {
                        return parseFloat(value.replace(/[^\d.]/g, '').replace(/\.(?=.*\.)/g, '')) || 0;
                    }
                    return typeof value === 'number' ? value : 0;
                };

                const totalAmount = cleanNumber(analysisResult.totalAmount);
                const vatTotal = cleanNumber(analysisResult.VATtotal);
                const grossAmount = cleanNumber(analysisResult.grossAmount);

                //duplicate check
                const duplicateInvoices = await checkDuplicateInvoices(
                    analysisResult.invoiceDate,
                    analysisResult.invoiceNumber,
                    analysisResult.companyName
                );

                if (documentId) {
                    const currentDocument = await Document.findById(documentId);

                    if (!currentDocument) {
                        return res.status(404).json({ message: "Document not found" });
                    }

                    const newInvoiceData = new InvoiceData({
                        documentId,
                        invoiceNumber: analysisResult.invoiceNumber || 'N/A',
                        trnNumber: analysisResult.TRNnumber || 'N/A',
                        totalAmount: totalAmount || 0,
                        vatTotal: vatTotal || 0,
                        companyName: analysisResult.companyName || 'Unknown',
                        imageUrl: fileUrl,
                        fileType: fileType,
                        invoiceDate: analysisResult.invoiceDate || "N/A",
                        grossAmount: grossAmount || 0,
                        billType: documentType || "N/A",
                        StatusUpdatedBy: userId,
                        paymentMode: paymentMode || "other",
                        duplicateStatus: duplicateInvoices.length > 0,
                        customerId:actualCustomerId
                    });
                    await newInvoiceData.save();
                    return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });




                } else {
                    const existingTitle = await Document.findOne({ title });

                    if (existingTitle) {
                        return res.status(400).json({ error: 'Document title already exists' });
                    }
                    const newDocument = new Document({
                        documentNumber: title,
                        title,
                        description,
                        documentType: documentType,
                        customerId: actualCustomerId,
                        uploadedBy: userId,
                        updatedBy: userId,
                        StatusUpdatedBy: userId,
                    });
                    const savedDocument = await newDocument.save();

                    const newDocumentId = savedDocument._id;

                    const newInvoiceData = new InvoiceData({
                        documentId: newDocumentId,
                        invoiceNumber: analysisResult.invoiceNumber || 'N/A',
                        trnNumber: analysisResult.TRNnumber || 'N/A',
                        totalAmount: totalAmount || 0,
                        vatTotal: vatTotal || 0,
                        companyName: analysisResult.companyName || 'Unknown',
                        imageUrl: fileUrl,
                        fileType: fileType,
                        invoiceDate: analysisResult.invoiceDate || "N/A",
                        grossAmount: grossAmount || 0,
                        billType: documentType || "N/A",
                        StatusUpdatedBy: userId,
                        paymentMode: paymentMode || "other",
                        duplicateStatus: duplicateInvoices.length > 0,
                        customerId:actualCustomerId

                    });
                    await newInvoiceData.save();
                    return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });
                }
            } else {
                return res.status(500).json({ error: 'No analysis result', message: 'Failed to extract invoice data' });
            }

        } catch (error) {
            console.error('Error processing file:', error);
            return res.status(500).json({ error: 'Error processing file', message: error.message });
        }
    });
};




//delete invoice data

export const deleteSingleInvoiceData = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID format"
            });
        }

        const deletedInvoice = await InvoiceData.findById(id);
        console.log("image url for invoice", deletedInvoice);


        if (!deletedInvoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        // Delete the image file if it exists

        if (deletedInvoice.imageUrl) {
            try {
                const deleteResponse = deleteFile(deletedInvoice.imageUrl)
            } catch (fileError) {
                console.error('Error deleting image file:', fileError);
                // Continue with invoice deletion even if image deletion fails
            }
        }

        // Delete the invoice from the database
        await InvoiceData.findByIdAndDelete(id);



        return res.status(200).json({
            success: true,
            message: "Invoice and associated image deleted successfully",
            data: deletedInvoice
        });
    } catch (error) {
        console.error('Error deleting invoice data:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};


//get documents using customer id

export const getCustomerWiseDocument = async (req, res) => {
    const { id } = req.params;
    const { search, page = 1, limit = 10, documentType, startDate, endDate } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    try {
        let query = { customerId: id };

        if (search) {
            query.$or = [
                { documentNumber: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } },
            ];
        }

        if (documentType) {
            query.documentType = documentType;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const total = await Document.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);

        const documents = await Document.find(query)
            .sort({ documentType: 1, createdAt: -1 })  // Sort by documentType first, then by creation date
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No documents found for this customer"
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Documents fetched successfully',
            data: documents,
            currentPage: pageNumber,
            totalPages: totalPages,
            totalItems: total,
        });
    } catch (error) {
        console.error('Error fetching document data:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};

//get invoices in document
export const getDocumentWiseInvoice = async (req, res) => {

    const { id } = req.params;
    const { search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    try {
        let query = { documentId: id };

        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: "i" } },
                // Add other fields you want to search
            ];
        }

        const total = await InvoiceData.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);

        const invoices = await InvoiceData.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        if (invoices.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No invoices found for this customer"
            });
        }

        return res.status(200).json({
            success: true,
            message: 'invoices fetched successfully',
            data: invoices,
            currentPage: pageNumber,
            totalPages: totalPages,
            totalItems: total,
        });
    } catch (error) {
        console.error('Error fetching document data:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};


// Get all documents 
export const getAllDocuments = async (req, res) => {
    const { search, page = 1, limit = 10, documentType, userId, startDate, endDate } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    try {
        let query = {};
        let customerId = null;

        // Fetch customerId based on userId
        if (userId) {
            const company = await Customer.findOne({ userId: userId });

            if (company) {
                customerId = company._id;
            }
        }
        if (customerId) {
            query.customerId = customerId;
        }

        // Search filter
        if (search) {
            query.$or = [
                { documentNumber: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } },
            ];
        }

        // Document type filter
        if (documentType) {
            query.documentType = documentType;
        }

        // Date filters
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Pagination and total count
        const total = await Document.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);

        // Fetch documents with sorting and pagination
        const documents = await Document.find(query)
            .sort({ createdAt: -1 }) // Sort by documentType first, then by creation date
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        // Check if documents were found
        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No documents found"
            });
        }

        // Return the response
        return res.status(200).json({
            success: true,
            message: 'Documents fetched successfully',
            data: documents,
            currentPage: pageNumber,
            totalPages: totalPages,
            totalItems: total,
        });
    } catch (error) {
        console.error('Error fetching document data:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};

//delete single documents when there is no invoices
export const deleteSingleDocument = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invalid document ID",
            });
        }

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "No document found with this ID",
            });
        }

        const invoices = await InvoiceData.findOne({ documentId: id });
        if (invoices) {
            return res.status(400).json({
                success: false,
                message: "Invoices are available in the document",
            });
        }

        const deleteDocument = await Document.findByIdAndDelete(id);
        if (!deleteDocument) {
            return res.status(404).json({
                success: false,
                message: "Document not found with this ID",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully",
            data: deleteDocument,
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete document due to server issues',
        });
    }
};


//get single invoice data
export const getSingleInvoiceData = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID format"
            });
        }

        // Find the invoice by ID
        const invoice = await InvoiceData.findById(id)
            .populate({
                path: 'documentId',
                select: 'documentNumber title description documentType' // Add or remove fields as needed
            });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: invoice
        });

    } catch (error) {
        console.error('Error fetching invoice data:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};



//edit single invoice
export const editSingleInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { invoiceNumber, trnNumber, totalAmount, vatTotal, companyName, invoiceDate, grossAmount, billStatus, ledger, paymentMode } = req.body;

        const invoice = await InvoiceData.findById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Update invoice fields if provided
        invoice.invoiceNumber = invoiceNumber || invoice.invoiceNumber;
        invoice.trnNumber = trnNumber || invoice.trnNumber;
        invoice.totalAmount = totalAmount || invoice.totalAmount;
        invoice.vatTotal = vatTotal || invoice.vatTotal;
        invoice.companyName = companyName || invoice.companyName;
        invoice.invoiceDate = invoiceDate || invoice.invoiceDate;
        invoice.grossAmount = grossAmount || invoice.grossAmount;
        invoice.billStatus = billStatus || invoice.billStatus;
        invoice.ledger = ledger || invoice.ledger;
        invoice.paymentMode = paymentMode || invoice.paymentMode;

        await invoice.save();


        return res.status(200).json({
            message: "Invoice updated successfully",
            invoice,
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        return res.status(500).json({ message: error.message });
    }
};



//edit single document
export const editSingleDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, documentType, customerId } = req.body;
        const userId = req.user.userId;


        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid document ID format"
            });
        }

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Update document fields if provided
        if (title) document.title = title;
        if (description) document.description = description;
        if (documentType) document.documentType = documentType;
        if (customerId) document.customerId = customerId;
        if (userId) document.updatedBy = userId;


        await document.save();

        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: document
        });
    } catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
};

//get single document using id
export const getSingleDocument = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ success: false, error: "invalid document id" })
        }
        const documentData = await Document.findById(id);
        if (!documentData) {
            return res.status(404).json({ success: false, error: "document not found with the id" })
        }
        return res.status(200).json({ success: true, message: "document fetched successfully", data: documentData })
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
}

//edit invoice status with ledger change
export const changeInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { billStatus, ledger } = req.body;
        const userId = req.user.userId;

        if (!ledger) {
            return res.status(404).json({
                success: false,
                message: "ledger not selected"
            });
        }
        if (!billStatus) {
            return res.status(404).json({
                success: false,
                message: "invalid payment status"
            });
        }
        const document = await InvoiceData.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }
        if (ledger) document.ledger = ledger;
        if (billStatus) document.billStatus = billStatus;
        if (userId) document.StatusUpdatedBy = userId;
        await document.save();
        return res.status(200).json({
            success: true,
            message: "invoice status updated successfully",
        });
    } catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
}

//edit document status
export const changeDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        const userId = req.user.userId;

        if (!paymentStatus) {
            return res.status(404).json({
                success: false,
                message: "invalid payment status"
            });
        }
        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }
        if (paymentStatus) document.paymentStatus = paymentStatus;
        if (userId) document.StatusUpdatedBy = userId;
        await document.save();
        return res.status(200).json({
            success: true,
            message: "document status updated successfully",
        });
    } catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: error.message
        });
    }
}


//get filtered invoices
export const getAllInvoices = async (req, res) => {
    try {
        const { dateFormat, startDate, endDate, billType, companyName } = req.query;

        const userId = req.user.userId;
        // Initialize query object
        let query = {};
        let customerId = null;

        

        if (userId) {
            const company = await Customer.findOne({ userId: userId });
            

            if (company) {
                customerId = company._id;

            }
        }
        if (customerId) {
            query.customerId = customerId;
        }

        // Handle billType filter
        if (billType) {
            query.billType = billType;
        } else {
            query.billType = { $in: ['sales', 'purchase', 'expense'] };
        }

        // Function to validate and format YYYY-MM-DD date
        const validateDate = (dateStr) => {
            if (!dateStr) return null;
            
            // Validate YYYY-MM-DD format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dateStr)) {
                throw new Error(`Invalid date format. Expected YYYY-MM-DD, got ${dateStr}`);
            }

            // Verify it's a valid date
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                throw new Error(`Invalid date: ${dateStr}`);
            }

            return dateStr; // Return as is since it's already in YYYY-MM-DD format
        };

        // Add date filter based on dateFormat
        if (startDate && endDate) {
            try {
                if (dateFormat === 'documentDate') {
                    // Filter by createdAt timestamp
                    const startDateTime = new Date(validateDate(startDate));
                    const endDateTime = new Date(validateDate(endDate));
                    
                    // Set endDateTime to end of day
                    endDateTime.setHours(23, 59, 59, 999);

                    query.createdAt = {
                        $gte: startDateTime,
                        $lte: endDateTime
                    };
                } else {
                    // For invoiceDate which is stored in DD-MM-YYYY format in the database
                    // We need to convert the incoming YYYY-MM-DD to DD-MM-YYYY for comparison
                    const startDateObj = new Date(validateDate(startDate));
                    const endDateObj = new Date(validateDate(endDate));
                    
                    const formatToDBDate = (date) => {
                        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
                    };

                    query.invoiceDate = {
                        $gte: formatToDBDate(startDateObj),
                        $lte: formatToDBDate(endDateObj)
                    };
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid Date Format",
                    message: error.message
                });
            }
        }

        // Add company name filter if provided
        if (companyName) {
            // Escape special regex characters in company name
            const escapedCompanyName = companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.companyName = { $regex: escapedCompanyName, $options: 'i' };
        }

        // Fetch invoices from database with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await InvoiceData.countDocuments(query);

        // Fetch paginated results
        const invoices = await InvoiceData.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            count: invoices.length,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: invoices
        });

    } catch (error) {
        console.error('Error in getAllInvoices:', error);
        return res.status(500).json({
            success: false,
            error: "Server Error",
            message: error.message
        });
    }
};


