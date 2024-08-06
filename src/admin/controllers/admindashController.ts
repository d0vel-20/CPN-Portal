import Center from "../../models/centerModel";
import { Request, Response } from 'express';

// create center
export const createCenter = async (req: Request, res: Response) =>{
    const {name, location, code } = req.body;

    // Validate input
    if (!name || !location || !code) {
    return res.status(400).json({ message: 'All fields are required' });
}

    try {
        // create a new center
        const newCenter = new Center({
            name, location, code,
        });

        // save to database
        await newCenter.save();

        return res.status(201).json({
            status: 201,
            data:{
                newCenter,
                message: 'Center Created Successfully',
            }
        })
    } catch (error) {
        console.error('Error Creating Center:', error);
        return res.status(500).json({ data: 'Internal Server error'})
    }

}

// get all centers
export const getAllCenters = async (req: Request, res: Response) => {
    try {
        // Retrieve all centers from the database
        const centers = await Center.find();

        return res.status(200).json({
            status: 200,
            data: {
                centers,
                message: 'Centers Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Centers:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


// get individual center
export const getCenterById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Find the center by ID
        const center = await Center.findById(id);

        if (!center) {
            return res.status(404).json({ message: 'Center not found' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                center,
                message: 'Center Retrieved Successfully',
            }
        });
    } catch (error) {
        console.error('Error Retrieving Center:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// editcenter

export const editCenter = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, location, code } = req.body;

    // Validate input
    if (!name && !location && !code) {
        return res.status(400).json({ message: 'At least one field is required to update' });
    }

    try {
        // Find the center by ID and update
        const updatedCenter = await Center.findByIdAndUpdate(
            id,
            { name, location, code },
            { new: true, runValidators: true }
        );

        if (!updatedCenter) {
            return res.status(404).json({ message: 'Center not found' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                updatedCenter,
                message: 'Center Updated Successfully',
            }
        });
    } catch (error) {
        console.error('Error Updating Center:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// delete center
export const deleteCenter = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Find the center by ID and delete
        const deletedCenter = await Center.findByIdAndDelete(id);

        if (!deletedCenter) {
            return res.status(404).json({ message: 'Center not found' });
        }

        return res.status(200).json({
            status: 200,
            data: {
                deletedCenter,
                message: 'Center Deleted Successfully',
            }
        });
    } catch (error) {
        console.error('Error Deleting Center:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
