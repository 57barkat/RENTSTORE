import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(@Req() req, @Body() body: CreatePostDto) {
    const userId = req.user?.id || '64f5b7...'; // Replace with auth user ID
    return this.postService.createPost(userId, body);
  }

  @Get()
  async findAll() {
    return this.postService.getAllPosts();
  }
}
