import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @Headers('authorization') authorization: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    // Extract token from Authorization header
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new BadRequestException('Token JWT manquant ou invalide');
    }

    const token = authorization.substring(7);
    return this.commentService.createComment(createCommentDto, token);
  }

  @Get()
  async getAllComments(): Promise<CommentResponseDto[]> {
    return this.commentService.findAll();
  }

  @Get('campaign/:campaignId')
  async getCommentsByCampaign(
    @Param('campaignId') campaignId: number,
  ): Promise<CommentResponseDto[]> {
    return this.commentService.findByCampaignId(+campaignId);
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id') id: string): Promise<void> {
    return this.commentService.deleteComment(id);
  }
}
