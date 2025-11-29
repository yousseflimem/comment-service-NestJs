export class CommentResponseDto {
  commentId: string;
  content: string;
  publicationDate: Date;
  lastModifiedDate: Date | null;
  campaignId: number;
  citizenId: number;

  constructor(partial: Partial<CommentResponseDto>) {
    Object.assign(this, partial);
  }
}
