import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private authService: AuthService,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    token: string,
  ): Promise<CommentResponseDto> {
    // Get current user from auth service
    const user = await this.authService.getCurrentUser(token);

    const newComment = new this.commentModel({
      content: createCommentDto.content,
      campaignId: createCommentDto.campaignId,
      citizenId: user.id,
      publicationDate: new Date(),
      lastModifiedDate: null,
    });

    const savedComment = await newComment.save();
    return this.toResponseDto(savedComment);
  }

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentModel.find().exec();
    return comments.map((comment) => this.toResponseDto(comment));
  }

  async findByCampaignId(campaignId: number): Promise<CommentResponseDto[]> {
    const comments = await this.commentModel
      .find({ campaignId })
      .exec();
    return comments.map((comment) => this.toResponseDto(comment));
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentModel.findById(id).exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.content = updateCommentDto.content || comment.content;
    comment.lastModifiedDate = new Date();

    const updatedComment = await comment.save();
    return this.toResponseDto(updatedComment);
  }

  async deleteComment(id: string): Promise<void> {
    const result = await this.commentModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }

  private toResponseDto(comment: CommentDocument): CommentResponseDto {
    return new CommentResponseDto({
      commentId: comment._id.toString(),
      content: comment.content,
      publicationDate: comment.publicationDate,
      lastModifiedDate: comment.lastModifiedDate,
      campaignId: comment.campaignId,
      citizenId: comment.citizenId,
    });
  }
}
