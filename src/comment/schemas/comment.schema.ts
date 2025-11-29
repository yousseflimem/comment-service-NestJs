import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  publicationDate: Date;

  @Prop({ type: Date, default: null })
  lastModifiedDate: Date;

  @Prop({ required: true })
  campaignId: number;

  @Prop({ required: true })
  citizenId: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
