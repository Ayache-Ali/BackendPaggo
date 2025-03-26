import { Controller, Post, Get, Param, Res, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import * as multer from 'multer';
@Controller('documents')
export class UploadController {
  constructor(private readonly UploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: multer.File, @Body() body: { userId: string }) {
    return await this.UploadService.saveFile(body.userId, file.originalname, file.buffer);
  }

  

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.UploadService.getFile(id);
    const base64String = Buffer.from(file.fileData).toString('base64');
    res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      fileName: file.filename,
      fileData: base64String,
      fileText: file.text,
    });
  }

  @Get('user/:userId')
  async getUserDocuments(@Param('userId') userId: string) {
    const documents = await this.UploadService.getUserDocuments(userId);
    if (documents.length === 0) {
      return { message: 'Nenhum documento encontrado.' };
    }
    return documents;
  }

  @Post(':id/explain-text')
  async explainText(@Param('id') id: string, @Body() body: { apiKey: string }) {
  const explanation = await this.UploadService.getChatExplanation(id, body.apiKey);
  return { explanation };
}
}