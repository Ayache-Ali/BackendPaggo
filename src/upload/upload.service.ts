import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import OpenAI from "openai";

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  private async extractTextFromImage(fileBuffer: Buffer): Promise<string> {
    const apiKey = 'K82981710988957'; // Coloque a chave da API OCR.space aqui
    const formData = new FormData();
    formData.append('base64Image', fileBuffer.toString('base64')); // Converte o buffer para base64

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'multipart/form-data',
      }
    });

    const parsedText = response.data.ParsedResults[0]?.ParsedText || '';
    return parsedText;
  }

  async getChatExplanation(id: string, apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new NotFoundException("Chave da API não fornecida.");
    }

    const file = await this.prisma.document.findUnique({ where: { id } });

    if (file && file.Chat && file.Chat.trim() !== "") {
      return file.Chat; // 🔹 Retorna a explicação salva
    }

    if (!file || !file.text) {
      throw new NotFoundException('Texto não encontrado.');
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Explique este texto: ${file.text}` }], 
      max_tokens: 200,
    });

    const explanation = response.choices[0].message?.content?.trim() || '';

    await this.prisma.document.update({
      where: { id },
      data: {Chat: explanation },
    });

    return explanation;
  }

  async saveFile(userId: string, filename: string, fileBuffer: Buffer) {
    const extractedText = await this.extractTextFromImage(fileBuffer);

    return this.prisma.document.create({
      data: {
        userId,
        filename,
        fileData: fileBuffer, 
        text: extractedText, 
        Chat: "",
      },
    });
  }

  async getFile(id: string) {
    const file = await this.prisma.document.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Arquivo não encontrado');
    return file;
  }

  async getUserDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true, 
      },
      orderBy: {
        filename: 'asc', 
      },
    });
  }
}
