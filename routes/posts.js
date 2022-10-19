const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//投稿作成
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//投稿編集
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿編集に成功しました！");
    } else {
      return res.status(403).json("あなたは他の人の投稿を編集できません");
    }
  } catch (err) {
    return res.status(403).json(err);
  }
});

//編集削除
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne({});
      return res.status(200).json("投稿を削除しました！");
    } else {
      return res.status(403).json("あなたは他の人の投稿を削除できません");
    }
  } catch (err) {
    return res.status(403).json(err);
  }
});

//特定の投稿を取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(403).json(err);
  }
});

//特定の投稿にいいねする
router.put("/:id/like", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({
          $push: {
            likes: req.body.userId,
          },
        });
        return res.status(200).json("投稿にいいねを押しました");
      } else {
        await post.updateOne({
          $pull: {
            likes: req.body.userId,
          },
        });
        return res.status(403).json("投稿にいいねを外しました");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  }
});

//プロフィール専用タイムラインの投稿を取得
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch {
    return res.status(500).json(err);
  }
});

//タイムラインの投稿を取得
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });

    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch {
    return res.status(500).json(err);
  }
});

// router.get("/", (req, res) => {
//   res.send("posts router");
// });

module.exports = router;
