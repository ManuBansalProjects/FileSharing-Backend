const mongoose = require('mongoose');
const {v4 : uuidv4} = require('uuid');
const path = require('path');
const fsPromise = require('fs').promises;

const fileModel = require('../../../models/files');
const userModel = require('../../../models/users');
const {CustomError} = require('../../../utils/customError');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    uploadFile : async(req, res, next) =>{
        try {
            const userId = req.user._id;
            
            if(!req.files || !req.files.file){
              throw new CustomError(400, 'File not found', 'uploadFile');         
            }

            const file = req.files.file;
            const fileOriginalName = String(file.name).toLowerCase();
            const fileModifiedName = `${uuidv4()}-${fileOriginalName}`;
            const uploadFilePath = path.join(__dirname, '..', '..', '..', 'public', 'uploadedFiles', fileModifiedName);

            file.mv(uploadFilePath, async(err)=>{
              if(err){
                throw new CustomError(400, 'File uplaod Failed', 'uploadFile');         
              }else{
                const fileData = {
                  user_id : userId,
                  file_original_name : fileOriginalName,
                  file_modified_name : fileModifiedName
                }
                const fileUploaded = await fileModel.create(fileData)   
                    
                return res
                .status(201)
                .json({success : true, message : 'File uploaded successfully', data : {fileId : fileUploaded._id}});
              }
            })
        } catch (error) {
            next(error);
        }
    },
    listFiles : async(req, res, next) =>{
        try {
            const userId = req.user._id;
            let { skip, limit, filter } = req.body;
            skip = skip || 0;
            limit = limit || 10;

            let json ={
              user_id : userId,
            }
            if(filter.name){
              json = {
                ...json,
                file_original_name : { $regex : new RegExp(filter.name, 'i') }
              }
              
            }
      
            const files = await fileModel.find(json)
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit);
            const count = await fileModel.countDocuments({user_id : userId});   

            res
            .status(200)
            .json({success : true, message : 'Success', data : { files, count }});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getSingleFile : async(req, res, next) =>{
        try {
            const { fileId } = req.params;
            const file = await fileModel.findOne({_id : fileId})
            .populate('comments.user_id', 'name')
            .populate('comments.replied_comments.user_id', 'name').lean();

            if(!file){
              throw new CustomError(400, 'File not found', 'getSingleFile');         
            }
            file.file_path = `${process.env.SERVER_URL}/uploadedFiles/${file.file_modified_name}`;

            res
            .status(200)
            .json({success : true, message : 'Success', data : { file }});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
   deleteFile : async(req, res, next) =>{
        try {
            const { fileId } = req.params;
            const file = await fileModel.findOne({_id : fileId});
            if(!file){
              throw new CustomError(400, 'File not found', 'deleteFile');         
            }
            await fileModel.deleteOne({_id : fileId});
            
            const filePath = path.join(__dirname, '..', '..', '..', 'public', 'uploadedFiles', file.file_modified_name);
            fsPromise.unlink(filePath, (err)=>{
              if(err){
                console.log('Error deleting file', err);
              }
            }) 
            
            res
            .status(200)
            .json({success : true, message : 'File deleted successfully', data : { file }});
        } catch (error) {
            console.log(error);
            next(error);
        }
   },
   
   
    getFileComments : async(req, res, next) =>{
        try {
            const { fileId } = req.params;
            const file = await fileModel.findOne({_id : fileId})
            .populate('comments.user_id', 'name')
            .populate('comments.replied_comments.user_id', 'name').lean();

            if(!file){
              throw new CustomError(400, 'File not found', 'getSingleFile');         
            }

            
            file.comments = file.comments?.sort((commentA, commentB)=>{
              const commentADate = new Date(commentA.createdAt).getTime();
              const commentBDate = new Date(commentB.createdAt).getTime();
              return commentBDate - commentADate;
            })

            let comments = file?.comments?.map(comment =>{
              return {
                user_id : comment.user_id?._id || null,
                user_name : comment.user_id?.name || 'unknown',
                comment : comment.comment,
                comment_id : comment._id,
                replied_comments : comment?.replied_comments?.map(comment =>{
                    return {
                      user_id : comment.user_id?._id || null,
                      user_name : comment.user_id?.name || 'unknown',
                      comment : comment.comment,
                      comment_id : comment._id,
                    }
                })
              }
            });

            res
            .status(200)
            .json({success : true, message : 'Success', data : { comments }});
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    addComment : async(req, res, next) =>{
      try {
          const { file_id, comment, user_id  } = req.body;
          const file = await fileModel.findOne({_id : file_id});
          if(!file){
            throw new CustomError(400, 'File not found', 'getSingleFile');         
          }
          file.comments.push({
            comment : comment,
            user_id : user_id || null
          })
          await file.save();

          res
          .status(200)
          .json({success : true, message : 'Commented successfully', data : { file }});
      } catch (error) {
          console.log(error);
          next(error);
      }
  },
  replyComment : async(req, res, next) =>{
      try {
          const { file_id, comment_id, comment, user_id  } = req.body;
          const file = await fileModel.findOne({_id : file_id});
          if(!file){
            throw new CustomError(400, 'File not found', 'getSingleFile');         
          }

          file.comments = file.comments.map(existingComment =>{
            if(existingComment._id == comment_id){
              return {
                ...existingComment,
                replied_comments : [...existingComment.replied_comments, {comment, user_id : user_id || null}]
              }
            }
            return existingComment;
          })
          await file.save();

          res
          .status(200)
          .json({success : true, message : 'Commented successfully', data : { file }});
      } catch (error) {
          console.log(error);
          next(error);
      }
  },
  deleteComment : async(req, res, next) =>{
      try {
          const { file_id, comment_id  } = req.body;
          const userId = req.user._id;

          const file = await fileModel.findOne({_id : file_id});
          if(!file){
            throw new CustomError(400, 'File not found', 'getSingleFile');         
          }

          file.comments = file.comments.filter(comment =>{
            return !(comment._id.toString() == comment_id.toString() && 
              comment.user_id.toString() == userId.toString())
          })
          await file.save();

          res
          .status(200)
          .json({success : true, message : 'Comment delete successfully', data : { file }});
      } catch (error) {
          console.log(error);
          next(error);
      }
  },
  deleteRepliedComment : async(req, res, next) =>{
      try {
          const { file_id, comment_id, replied_comment_id  } = req.body;
          const userId = req.user._id;

          const file = await fileModel.findOne({_id : file_id});
          if(!file){
            throw new CustomError(400, 'File not found', 'getSingleFile');         
          }

          file.comments = file.comments.map(comment =>{
            return comment._id.toString() != comment_id.toString()
            ? comment
            : {
                ...comment,
                replied_comments : comment.replied_comments.filter(repliedComment =>{
                  return !(repliedComment._id.toString() == replied_comment_id.toString() && 
                    userId.toString() == repliedComment.user_id.toString())
                })
              }
          })
          await file.save();

          res
          .status(200)
          .json({success : true, message : 'Comment delete successfully', data : { file }});
      } catch (error) {
          console.log(error);
          next(error);
      }
  },
}