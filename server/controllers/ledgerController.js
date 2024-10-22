import InvoiceData from "../models/invoiceData.js";
import LedgerData from "../models/ledgerSchema.js";


//create new ledger
export const createLedgerData = async (req, res) => {
    try {
        const { ledgerName, description } = req.body;
        const createdBy = req.user?.userId || null;

        const existingLedger = await LedgerData.findOne({ ledgerName });
        if (existingLedger) {
            return res.status(400).json({
                error: "ledger already available with the same name"
            });
        }

        const newLedgerData = new LedgerData({
            ledgerName,
            description,
            createdBy,
            updatedBy:createdBy
        });

        const savedLedgerData = await newLedgerData.save();
        return res.status(201).json(savedLedgerData);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

//get all ledger
export const getAllLedgerData = async (req, res) => {
    try {
        const allLedgerData = await LedgerData.find();
        return res.status(200).json(allLedgerData);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving ledger data",
            error: error.message
        });
    }
};

//get ledger wise invoice
export const getLedgerWiseInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoiceData = await InvoiceData.find({ ledger: id });

        if (!invoiceData || invoiceData.length === 0) {
            return res.status(404).json({
                error: "No invoices found for this ledger"
            });
        }

        return res.status(200).json(invoiceData);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving ledger data",
            error: error.message
        });
    }
};


//edit ledger
export const editLedger = async (req, res) => {
    try {
        const { id } = req.params;
        const { ledgerName, description } = req.body;
        const userId = req.user.userId;

        const ledger = await LedgerData.findById(id);

        if (!ledger) {
            return res.status(404).json({ message: "ledger not found" });
        }

        if (ledgerName) ledger.ledgerName = ledgerName;
        if (description) ledger.description = description;
        if(userId) ledger.updatedBy=userId

        await ledger.save();
        return res.status(200).json({
            message: "ledger edited successfully",
            data: ledger,
        });
    }catch(error){
        return res.status(500).json({
            message: "Error editing ledger data",
            error: error.message
        });
    }
    
}

//delete ledger
export const deleteLedger = async (req, res) => {
    try {
        const { id } = req.params;

        // First check if ledger exists
        const ledger = await LedgerData.findById(id);

        if (!ledger) {
            return res.status(404).json({
                message: "Ledger not found"
            });
        }

        await LedgerData.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Ledger deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting ledger",
            error: error.message
        });
    }
}
