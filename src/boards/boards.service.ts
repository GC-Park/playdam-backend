import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardStatus } from './board-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  // 모든 유저의 게시물 가져오기
  // async getAllBoards(): Promise<Board[]> {
  //   return this.boardRepository.find();
  // }

  // 해당 유저의 게시물만 가져오기
  async getAllBoards(user: User): Promise<Board[]> {
    const query = this.boardRepository.createQueryBuilder('board');

    query.where('board.userId = :userId', { userId: user.id });

    const boards = await query.getMany();

    return boards;
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    const { title, description } = createBoardDto;
    const board = this.boardRepository.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
      user,
    });

    await this.boardRepository.save(board);
    return board;
  }

  async getBoardById(id: number): Promise<Board> {
    const found = await this.boardRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(`Can't find Board with id${id}`);
    }

    return found;
  }

  async deleteBoard(id: number): Promise<void> {
    const result = await this.boardRepository.delete(id);

    console.log('result', result);
  }

  async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    const board = await this.getBoardById(id);

    board.status = status;
    await this.boardRepository.save(board);

    return board;
  }
}
