import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../repositories/UsersRepository';

class UserController {
    async create(request: Request, response: Response) {
        const { name, email } = request.body;
        
        const userRepository = getCustomRepository(UserRepository);
        
        const userAlreadyExits = await userRepository.findOne({ email });

        if(userAlreadyExits) {
            return response.status(400).json({ error: 'User already exists!' });
        }
        
        const user = userRepository.create({
            name, email
        });

        userRepository.save(user);

        return response.status(201).json(user);
    }
}

export { UserController };
