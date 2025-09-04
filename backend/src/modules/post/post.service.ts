import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { FcmService } from 'src/firebase/fcm.service';
import { User } from '../user/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    private fcmService: FcmService,
  ) {}

  async createPost(userId: string, postDto: CreatePostDto) {
    const post = await this.postModel.create({
      ...postDto,
      userId,
    }) as Post & { _id: any };
    const users = await this.userModel.find({
      subscriptions: post.category,
      fcmToken: { $exists: true, $ne: '' },
    });

    const tokens = users.map((u) => (u as any).fcmToken);

    if (tokens.length) {
      await this.fcmService.sendNotification(tokens, 'New Property Posted!', post.title, {
        postId: post._id.toString(),
      });
    }

    return post;
  }

  async getAllPosts() {
    return this.postModel.find().populate('userId', 'name email');
  }
}
