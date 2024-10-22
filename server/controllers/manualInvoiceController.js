import Customer from "../models/customer.js";
import Document from "../models/document.js";
import InvoiceData from "../models/invoiceData.js";


//add manual invoices
export const addManualInvoices = async (req, res) => {
    try {
        const { documentId, customerId, documentType, title, description, totalAmount, vatTotal, companyName, grossAmount } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({ error: 'Document title is required' });
        }

        const existingTitle = await Document.findOne({ title });
        if (existingTitle) {
            return res.status(400).json({ error: 'Document title already exists' });
        }

        let actualCustomerId = customerId;
        if (!customerId) {
            const customer = await Customer.findOne({ userId });
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found for the given userId' });
            }
            actualCustomerId = customer._id;
        }

        const newInvoiceData = new InvoiceData({
            documentId: documentId || null,
            totalAmount: Number(totalAmount) || 0,
            vatTotal: Number(vatTotal) || 0,
            companyName: companyName || 'Unknown',
            grossAmount: Number(grossAmount) || 0
        });

        if (documentId) {
            const currentDocument = await Document.findById(documentId);
            if (!currentDocument) {
                return res.status(404).json({ error: "Document not found" });
            }

            currentDocument.grossAmount = Number((currentDocument.grossAmount || 0) + (grossAmount || 0)).toFixed(2);
            currentDocument.totalAmount = Number((currentDocument.totalAmount || 0) + (totalAmount || 0)).toFixed(2);
            currentDocument.totalVAT = Number((currentDocument.totalVAT || 0) + (vatTotal || 0)).toFixed(2);
            currentDocument.numberOfUploadedFiles = (currentDocument.numberOfUploadedFiles || 0) + 1;

            await Promise.all([newInvoiceData.save(), currentDocument.save()]);

            return res.json({ result: { newInvoiceData }, message: "Invoice data saved successfully" });
        } else {
            const lastDocument = await Document.findOne().sort('-documentNumber');
            const nextNumber = lastDocument ? parseInt(lastDocument.documentNumber.slice(3)) + 1 : 1;
            const documentNumber = `DOC${nextNumber.toString().padStart(4, '0')}`;

            const newDocument = new Document({
                documentNumber,
                title,
                description,
                documentType,
                customerId: actualCustomerId,
                uploadedBy: userId,
                updatedBy: userId,
                grossAmount: Number(grossAmount) || 0,
                totalAmount: Number(totalAmount) || 0,
                totalVAT: Number(vatTotal) || 0,
                numberOfUploadedFiles: 1
            });

            const [savedDocument, savedInvoiceData] = await Promise.all([
                newDocument.save(),
                newInvoiceData.save()
            ]);

            savedInvoiceData.documentId = savedDocument._id;
            await savedInvoiceData.save();

            return res.json({ result: { newInvoiceData: savedInvoiceData }, message: "Invoice data saved successfully" });
        }
    } catch (error) {
        console.error('Error in addManualInvoices:', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};
