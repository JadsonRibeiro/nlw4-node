import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { SurveyRepository } from "../repositories/SurveysRepository";
import { SurveyUserRepository } from "../repositories/SurveysUsersRepository";
import { UserRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);
        const surveyUserRepository = getCustomRepository(SurveyUserRepository);

        const user = await userRepository.findOne({ email });

        if(!user) {
            return response.status(400).json({
                error: 'User does not exists'
            });
        }

        const survey = await surveyRepository.findOne({ id: survey_id });

        if(!survey) {
            return response.status(400).json({
                error: 'Survey does not exists'
            });
        }

        let surveyUser = await surveyUserRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ['user', 'survey']
        });

        if(!surveyUser) {
            surveyUser = surveyUserRepository.create({
                survey_id,
                user_id: user.id
            });
            await surveyUserRepository.save(surveyUser);
        }

        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: surveyUser.id,
            link: process.env.URL_MAIL
        }

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.status(201).json(surveyUser);
    }
}

export { SendMailController }