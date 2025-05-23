import { Request, Response } from 'express';
import { BlockUserUseCase } from '../application/BlockUserUseCase';
import { UnblockUserUseCase } from '../application/UnblockUserUseCase';
import { RemoveUserUseCase } from '../application/RemoveUserUseCase';

const blockUserUseCase = new BlockUserUseCase();
const unblockUserUseCase = new UnblockUserUseCase();
const removeUserUseCase = new RemoveUserUseCase();

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    await blockUserUseCase.execute(username);
    res.status(200).json({ message: 'User blocked' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    await unblockUserUseCase.execute(username);
    res.status(200).json({ message: 'User unblocked' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    await removeUserUseCase.execute(username);
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}; 