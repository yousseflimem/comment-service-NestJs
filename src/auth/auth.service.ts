import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserDto } from './dto/user.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:8081';
  }

  async getCurrentUser(token: string): Promise<UserDto> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.message || 'Failed to authenticate user',
          error.response?.status || HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        'Failed to connect to auth service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
