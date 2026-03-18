import { PASSWORD_LENGTH } from './gameConfig';

export const randomChoice = (list) => list[Math.floor(Math.random() * list.length)];

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let output = '';
  for (let i = 0; i < PASSWORD_LENGTH; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
};
