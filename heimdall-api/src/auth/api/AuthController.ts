import { Request, Response } from 'express';
import { SignupUseCase } from '../application/SignupUseCase';
import { LoginUseCase } from '../application/LoginUseCase';
import { LogoutUseCase } from '../application/LogoutUseCase';

const signupUseCase = new SignupUseCase();
const loginUseCase = new LoginUseCase();
const logoutUseCase = new LogoutUseCase();

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await signupUseCase.execute(username, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await loginUseCase.execute(username, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await logoutUseCase.execute(refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}; 