import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'
import s3 from '../config/s3_config.js'
import {upload} from '../utils/uploadFile.js';
import { 
  getPresignedUrl, 
  deleteObjectFromS3, 
  deleteObjectsFromS3, 
} from '../utils/uploadFile.js'; // Import utility function


// @desc    Fetch all unique and non empty categories
// @route   GET /api/admin/exhibits/maintenance
// @access  Private/Admin
const getMaintenanceList = async (req, res) => {
    try {
      const categoriesQuery    = "SELECT DISTINCT category_id, category_name FROM category where active_ind='Y'"; 
      const locationQuery      = "SELECT DISTINCT location_id, location_name FROM location where active_ind='Y'"; 
      const locationTypesQuery = "SELECT DISTINCT  id, location_type FROM location_type where active_ind='Y'";
      const roomQuery          = "SELECT DISTINCT room_id, room_name FROM room where active_ind='Y'";
  
      const [categoriesResults,locationResults,locationTypesResults,roomResults] = await Promise.all([
        db.promise().query(categoriesQuery),
        db.promise().query(locationQuery),
        db.promise().query(locationTypesQuery),
        db.promise().query(roomQuery),
      ]);
  
      if (
        categoriesResults[0] && categoriesResults[0].length > 0 &&
        locationTypesResults[0] && locationTypesResults[0].length > 0 &&
        locationResults[0] && locationResults[0].length > 0 &&
        roomResults[0] && roomResults[0].length > 0
      ) {
        const categories = categoriesResults[0]
          .map((row) => ({
            id: row.category_id,
            name: row.category_name,
          }))
          .filter((category) => category.name !== null && category.name !== '');
      
        const locationTypes = locationTypesResults[0]
          .map((row) => ({
            id: row.id,
            name: row.location_type,
          }))
          .filter((location_type) => location_type.name !== null && location_type.name !== '');
      
        const locations = locationResults[0]
          .map((row) => ({
            id: row.location_id,
            name: row.location_name,
          }))
          .filter((location) => location.name !== null && location.name !== '');
      
        const rooms = roomResults[0]
          .map((row) => ({
            id: row.room_id,
            name: row.room_name,

          }))
          .filter((room) => room.name !== null && room.name !== '');
          res.status(200).json({ categories, locationTypes, locations, rooms });
        }
    else {
        return res.status(404).json({ message: 'No categories or location types found' });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };  


// @desc    Create new category
// @route   POST /api/exhibits/maintenance/category
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const {category}= req.body;
    try {
      const query = 'Insert into category(category_name,active_ind) VALUES(?, ?)';
      const [results, fields] = await db.promise().query(query,[category,'Y']);
  
      if (results && results.affectedRows > 0) {
        const newCategoryId = results.insertId;
        res.status(201).json({ message: 'Category created successfully' , id : newCategoryId});
      } else {
        return res.status(401).json({ message: "Failed to create category" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
  
// @desc    Update category
// @route   PUT /api/exhibits/maintenance/category
// @access  Private/Admin

  const updateCategory = asyncHandler(async (req, res) => {
    const {category,id}= req.body;
    try {
      const selectQuery = "SELECT * FROM Category WHERE category_id=? AND active_ind='Y'";
      const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);
  
      if (selectResults && selectResults.length > 0) {
        const updateQuery ="UPDATE category SET category_name=? WHERE category_id=? and active_ind='Y'";
        const [updateResults, updateFields] = await db.promise().query(updateQuery, [category,id]);
  
        if (updateResults.affectedRows > 0) {
          return res.status(200).json({ message: "Successfully updated category" }); // wrong status code for dev env
        } else {
          return res.status(500).json({ message: "Couldn't update category" });
        }
      } else {
        return res.status(404).json({ message: "Category doesn't exist" });
      }
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({ message: err.message });
    }
  });

// @desc    Delete exhibit
// @route   DELETE /api/exhibits/maintenance/category
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  try {
    const selectQuery = "SELECT * FROM category WHERE category_id IN (?) AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE category SET active_ind='N' WHERE category_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully deleted category" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "No categories were deleted" });
      }
    } else {
      return res.status(404).json({ message: "Categories doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    Undo delete category
// @route   PUT /api/exhibits/maintenance/category
// @access  Private/Admin
const undoDeleteCategory = asyncHandler(async (req, res) => {

  const { ids } = req.body.data;
  
  try { // UPDATE exhibits SET active_ind='N' WHERE exhibit_id IN (?)
    const selectQuery = "SELECT * FROM category WHERE category_id IN (?) AND active_ind='N'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE category SET active_ind='Y' WHERE category_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
     
        return res.status(200).json({ message: "Successfully restored categories" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "Couldn't restore categories" });
      }
    } else {
      return res.status(404).json({ message: "Categories doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


  // @desc    Create new location
// @route   POST /api/exhibits/maintenance/location
// @access  Private/Admin
const createLocation = asyncHandler(async (req, res) => {
    const {location}= req.body;
    try {
      const query = 'Insert into location(location_name,active_ind) VALUES(?, ?)';
      const [results, fields] = await db.promise().query(query,[location,'Y']);
  
      if (results && results.affectedRows > 0) {
        const newLocationId = results.insertId;
        res.status(201).json({ message: 'Location created successfully' , id : newLocationId});
      } else {
        return res.status(401).json({ message: "Failed to create location" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
  
// @desc    Update location
// @route   PUT /api/exhibits/maintenance/location
// @access  Private/Admin
  const updateLocation = asyncHandler(async (req, res) => {
    const {location,id}= req.body;
    try {
      const selectQuery = "SELECT * FROM location WHERE location_id=? AND active_ind='Y'";
      const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);
  
      if (selectResults && selectResults.length > 0) {
        const updateQuery ="UPDATE location SET location_name=? WHERE location_id=? and active_ind='Y'";
        const [updateResults, updateFields] = await db.promise().query(updateQuery, [location,id]);
  
        if (updateResults.affectedRows > 0) {
          return res.status(200).json({ message: "Successfully updated location" }); // wrong status code for dev env
        } else {
          return res.status(500).json({ message: "Couldn't update location" });
        }
      } else {
        return res.status(404).json({ message: "location doesn't exist" });
      }
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({ message: err.message });
    }
  });

// @desc    Create new location type
// @route   POST /api/exhibits/maintenance/location_type
// @access  Private/Admin
const createLocationType = asyncHandler(async (req, res) => {
    const {location_type}= req.body;
    try {
      const query = 'Insert into location_type(location_type,active_ind) VALUES(?, ?)';
      const [results, fields] = await db.promise().query(query,[location_type,'Y']);
  
      if (results && results.affectedRows > 0) {
        const newId = results.insertId;
        res.status(201).json({ message: 'Locationtype created successfully' , id : newId});
      } else {
        return res.status(401).json({ message: "Failed to create Locationtype" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
  
// @desc    Update category
// @route   PUT /api/exhibits/maintenance/location_type
// @access  Private/Admin

  const updateLocationType = asyncHandler(async (req, res) => {
    const {location_type,id}= req.body;
    try {
      const selectQuery = "SELECT * FROM location_type WHERE id=? AND active_ind='Y'";
      const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);
  
      if (selectResults && selectResults.length > 0) {
        const updateQuery ="UPDATE location_type SET location_type=? WHERE id=? and active_ind='Y'";
        const [updateResults, updateFields] = await db.promise().query(updateQuery, [location_type,id]);
  
        if (updateResults.affectedRows > 0) {
          return res.status(200).json({ message: "Successfully updated location_type" }); // wrong status code for dev env
        } else {
          return res.status(500).json({ message: "Couldn't update location_type" });
        }
      } else {
        return res.status(404).json({ message: "Location_type doesn't exist" });
      }
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({ message: err.message });
    }
  });

// @desc    Create new Room
// @route   POST /api/exhibits/maintenance/room
// @access  Private/Admin
const createRoom = asyncHandler(async (req, res) => {
    const {room}= req.body;
    try {
      const query = 'Insert into room(room_name,active_ind) VALUES(?, ?)';
      const [results, fields] = await db.promise().query(query,[room,'Y']);
  
      if (results && results.affectedRows > 0) {
        const newRoomId = results.insertId;
        res.status(201).json({ message: 'Room created successfully' , id : newRoomId});
      } else {
        return res.status(401).json({ message: "Failed to create room" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
  
// @desc    Update room
// @route   PUT /api/exhibits/maintenance/room
// @access  Private/Admin

  const updateRoom = asyncHandler(async (req, res) => {
    const {room,id}= req.body;
    try {
      const selectQuery = "SELECT * FROM room WHERE room_id=? AND active_ind='Y'";
      const [selectResults, selectFields] = await db.promise().query(selectQuery, [id]);
  
      if (selectResults && selectResults.length > 0) {
        const updateQuery ="UPDATE room SET room_name=? WHERE room_id=? and active_ind='Y'";
        const [updateResults, updateFields] = await db.promise().query(updateQuery, [room,id]);
  
        if (updateResults.affectedRows > 0) {
          return res.status(200).json({ message: "Successfully updated Room" }); // wrong status code for dev env
        } else {
          return res.status(500).json({ message: "Couldn't update Room" });
        }
      } else {
        return res.status(404).json({ message: "Room doesn't exist" });
      }
    } catch (err) {
      console.log(err.message)
      return res.status(500).json({ message: err.message });
    }
  });




// @desc    Delete location
// @route   DELETE /api/exhibits/maintenance/location/:id
// @access  Private/Admin
const deleteLocation = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  try {
    const selectQuery = "SELECT * FROM location WHERE location_id IN (?) AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE location SET active_ind='N' WHERE location_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully deleted location" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "No location were deleted" });
      }
    } else {
      return res.status(404).json({ message: "location doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @desc    Delete location Type
// @route   DELETE /api/exhibits/maintenance/location/:id
// @access  Private/Admin
const deleteLocationType = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  try {
    const selectQuery = "SELECT * FROM location_type WHERE id IN (?) AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE location_type SET active_ind='N' WHERE id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully deleted location_type" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "No location_type were deleted" });
      }
    } else {
      return res.status(404).json({ message: "location_type doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// @desc    Delete Room
// @route   DELETE /api/exhibits/maintenance/room
// @access  Private/Admin
const deleteRoom = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  try {
    const selectQuery = "SELECT * FROM room WHERE room_id IN (?) AND active_ind='Y'";
    const [selectResults, selectFields] = await db.promise().query(selectQuery, [ids]);

    if (selectResults && selectResults.length > 0) {
      const updateQuery = "UPDATE room SET active_ind='N' WHERE room_id IN (?)";
      const [updateResults, updateFields] = await db.promise().query(updateQuery, [ids]);

      if (updateResults.affectedRows > 0) {
        return res.status(200).json({ message: "Successfully deleted room" }); // Successfully deleted, no content to send
      } else {
        return res.status(500).json({ message: "No room were deleted" });
      }
    } else {
      return res.status(404).json({ message: "room doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
  
  export {
     getMaintenanceList,
     createCategory,
     updateCategory,
     deleteCategory,
     undoDeleteCategory,
     createLocation,
     updateLocation,
     deleteLocation,
     createLocationType,
     updateLocationType,
     deleteLocationType,
     createRoom,
     updateRoom,
      deleteRoom
  };