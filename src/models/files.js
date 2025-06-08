const  mongoose = require("mongoose");


const repliedCommentSchema = new mongoose.Schema(
   {
      comment : { type : String, required : true },
      user_id : { type: mongoose.Types.ObjectId, ref : 'users'},
    },
    { timestamps : true }
)

const commentSchema = new mongoose.Schema(
   {
      comment : { type : String, required : true },
      user_id : { type: mongoose.Types.ObjectId, ref : 'users'},
      replied_comments : {
        type : [ repliedCommentSchema ],
        default : []
      }
    },
    { timestamps : true }
)

const FileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref : 'users',
      required: true,
    },
    file_modified_name: {
      type: String,
      required: true,
    },
    file_original_name: {
      type: String,
      required: true,
    },
    comments : {
      type : [
        commentSchema
      ],
      default : []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("files", FileSchema);
