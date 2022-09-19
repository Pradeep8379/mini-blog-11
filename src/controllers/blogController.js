const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")
let timeElapsed = Date.now();
let today = new Date(timeElapsed);
// =================================createBlog====================================================
const createBlog = async function (req, res) {
    try {
        let data = req.body
        if (!data)
            return res.status(400).send({ status: false, msg: "enter data" })
        let AuthorId = data.authorId
        if (!AuthorId) return res.status(404).send({ status: false, msg: "AuthorId Missing" })
        if (AuthorId.length > 24 || AuthorId.length < 24)
            return res.status(400).send({ status: false, msg: "Invalid ID" })

        let correctAuthorId = await authorModel.findById(AuthorId)
        if (!correctAuthorId) return res.status(404).send({ status: false, msg: "AuthorId is not Valid" })

        if (data.isPublished) {
            data.publishedAt = today
        }
        if (data.deletedAt) {
            data.deletedAt = today
        }


        let savedData = await blogModel.create(data)
        res.status(201).send({ status: true, data: savedData })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}
// =============================================================================================
const getBlogs = async function (req, res) {

    try {
        let filters = req.query;

        if (Object.keys(filters).length == 0) {

            let data = await blogModel.find({ isDeleted: false, isPublished: true })
            return res.status(200).send({ status: true, data: data })
        }
        filters["isDeleted"] = false;
        filters["isPublished"] = true;
        if (Object.keys(filters).length > 6) {
            return res.status(400).send({ status: false, msg: "enter valid filters" })
        }

        let data = await blogModel.findOne(filters).populate("authorId")
        if (!data) return res.status(404).send({ status: false, msg: "file not found!" })
        return res.status(200).send({ status: true, data: data })

    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
// =============================================================================================

const updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        let updates = req.body
        if (Object.keys(updates).length == 0)
            return res.status(400).send({ status: false, msg: "send something to update" })
        let stringUpdates = {
            isPublished: true,
            publishedAt: today
        };
        let arrayUpdates = {};
        if (updates["title"])
            stringUpdates["title"] = updates.title;
        if (updates["body"])
            stringUpdates["body"] = updates.body;
        if (updates["tags"])
            arrayUpdates["tags"] = updates.tags;
        if (updates["subcategory"])
            arrayUpdates["subcategory"] = updates.subcategory;
        let check = await blogModel.findById({_id:blogId });
        if(check.isDeleted)  return res.status(404).send({ status: false, msg: "blog does not exist" })
        let updatedBlog = await blogModel.findByIdAndUpdate({ _id:blogId }, { $set: stringUpdates, $push: arrayUpdates }, { new: true })
        return res.status(200).send({ status: true, data: updatedBlog })
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
// =============================================================================================

const deleteBlogsParam = async (req, res) => {
    try {
        let iDfromParams = req.params.blogId
        if (!iDfromParams)
            return res.status(400).send({ status: false, msg: "pleas enter  ID" })
        if (iDfromParams.length > 24 || iDfromParams.length < 24)
        return res.status(400).send({ status: false, msg: "Invalid ID" })

        let data03 = await blogModel.findById(iDfromParams)
      
        if (!data03)
           return res.status(400).send({ status: false, msg: "Invalid ID" })
        if (data03.isDeleted) {
            return res.status(404).send({ status: false, msg: "blog document doesn't exist" })
        }
       
         await blogModel.updateOne((data03), { $set: { isDeleted: true , deletedAt: today } })
        return res.status(200).send({status:true})
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
// =============================================================================================

const deleteBlogsQuery = async function (req, res) {
    try {     
       let data = req.data
       console.log(data)
        if (data.isDeleted) {
            return res.status(404).send({ status: false, msg: "blog document doesn't exist" })
        }
        if (data.isPublished) {
            return res.status(404).send({ status: false, msg: "blog document doesn't exist" })
        }
        const data2 = await blogModel.updateMany(data, { $set: { isDeleted: true, deletedAt: today } })
        res.status(200).send({ status: true, data: data2 })

    } catch (error) {
        res.status(500).send({ mas: error.message })
    }
}
module.exports = { getBlogs, createBlog, updateBlog, deleteBlogsParam, deleteBlogsQuery }
