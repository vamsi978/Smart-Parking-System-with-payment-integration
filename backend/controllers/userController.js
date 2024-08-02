import asyncHandler from '../middleware/asyncHandler.js';
import { iventoryDBConnection as db } from '../config/db.js';
import { getAttachmentsUtils, getPresignedUrlsUtils } from '../utils/attachmentUtils.js'; // Import the correct function
import dotenv from 'dotenv';
dotenv.config();

// exhibit description
// image urls - 5
// related exhibits - 2

// @desc    Fetch exhibit description, image links, related exhibit names
// @route   GET /api/user/exhibit/:id
// @access  Public
const getExhibitForUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // console.log('Hi, everything will be fine')

  try {
    const query = "SELECT title, exhibit_desc FROM exhibits WHERE exhibit_id=? and active_ind='Y'";
    const [results, fields] = await db.promise().query(query, [id]);
    // console.log('desc:',results[0])
    if (results && results.length > 0) {
      const attachments = await getAttachmentsUtils(id);

      const objectKeys = attachments.data ? attachments.data.map((attachment) => ({
        folderName: attachment.file_location,
        fileName: attachment.file_name,
      })) : [];
      const presignedURLS = await getPresignedUrlsUtils(objectKeys); 
      res.status(200).json({
        title: results[0].title,
        exhibit_desc: results[0].exhibit_desc,
        attachmentURLS : presignedURLS, 
      });
    } else {
      return res.status(404).json({ message: "Exhibit doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// @desc    get related exhibits -> images, urls 
// @route   GET /api/user/get-related-exhibit/:id
// @access  Private/Admin
const getRelatedExhibits = asyncHandler(async (req, res) => {
  const { id } = req.params;


  try {
    const selectQuery = `
    select related_exhibit_id, related_exhibit_title, file_name, file_location 
    from (
      select img.related_exhibit_id, img.related_exhibit_title, atch.file_name, atch.file_location,
      row_number() over (partition by img.related_exhibit_id order by atch.file_name) as rn
      FROM  attachments atch
      right join (
        select distinct related_exhibit_id, related_exhibit_title
        from related_exhibits re
        inner join exhibits e on re.related_exhibit_id = e.exhibit_id and e.active_ind = 'Y'
        where re.exhibit_id = ?
      ) img
      on atch.exhibit_id = img.related_exhibit_id
    ) images 
    where rn = 1`;

    const [existenceResults, existenceFields] = await db.promise().query(selectQuery, [id]);
  
    if (!existenceResults || existenceResults.length === 0) {
      return res.status(404).json({ message: "Related Exhibit doesn't exist" });
    }

    res.status(200).json({ message: "Related Exhibits retrieved successfully", data: existenceResults });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


const generatePreSignedUrl = asyncHandler(async (req, res) => {
  try {
    const objectKeys = req.body // Parse the request body properly
    console.log(objectKeys);
    const presignedURLS = await getPresignedUrlsUtils(objectKeys);
    console.log(presignedURLS)
    res.status(200).json({data:presignedURLS});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export {
  getExhibitForUser,
  getRelatedExhibits,
  generatePreSignedUrl
};
