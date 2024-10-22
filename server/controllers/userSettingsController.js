import UiSettings from "../models/userSettingsSchema.js";

export const applyNewSettingsChange = async (req, res) => {
    const { id } = req.params;
    const {
        pagenationLimit,
        chartType,
        dateFormat,
        timeFormat,
        tableHeadBg,
        tableHeadText,
        tableStripped,
        tableHover,
        tableBorder
    } = req.body;
    
    try {
        let settings = await UiSettings.findOne({ userId: id });
        
        if (settings) {
            // Update existing settings
            Object.assign(settings, {
                pagenationLimit: pagenationLimit !== undefined ? pagenationLimit : settings.pagenationLimit,
                chartType: chartType !== undefined ? chartType : settings.chartType,
                dateFormat: dateFormat !== undefined ? dateFormat : settings.dateFormat,
                timeFormat: timeFormat !== undefined ? timeFormat : settings.timeFormat,
                tableHeadBg: tableHeadBg !== undefined ? tableHeadBg : settings.tableHeadBg,
                tableHeadText: tableHeadText !== undefined ? tableHeadText : settings.tableHeadText,
                tableStripped: tableStripped !== undefined ? tableStripped : settings.tableStripped,
                tableHover: tableHover !== undefined ? tableHover : settings.tableHover,
                tableBorder: tableBorder !== undefined ? tableBorder : settings.tableBorder
            });

            await settings.save();
            return res.status(200).json({ message: "User settings have been updated", userSettings: settings });
        } else {
            // Create new settings
            settings = new UiSettings({
                userId: id,
                pagenationLimit,
                chartType,
                dateFormat,
                timeFormat,
                tableHeadBg,
                tableHeadText,
                tableStripped,
                tableHover,
                tableBorder
            });
            await settings.save();
            return res.status(201).json({ message: "User settings have been created", userSettings: settings });
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ message: "An error occurred while updating settings" });
    }
};

export const getSettings = async (req, res) => {
    const { id } = req.params;
    try {
        const settingsData = await UiSettings.findOne({ userId: id });
        if (!settingsData) {
            return res.status(404).json({ message: "No preset data for the user settings" });
        } else {
            return res.status(200).json({ message: "User setting data fetched successfully", settingsData: settingsData });
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ message: "An error occurred while fetching settings" });
    }
};