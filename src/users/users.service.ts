import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from 'src/common/DTO';
import { RegisterResponse } from 'src/common/interface/user.interface';

@Injectable()
export class UsersService {
  async register(payload: CreateUserDTO): Promise<RegisterResponse> {
    return;
  }
}
