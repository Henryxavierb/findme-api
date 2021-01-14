const {Op} = require('sequelize');
const Users = require('../models/User');
const Events = require('../models/Event');
const {sendEmail, generateToken} = require('../utils/index');
const ProvideException = require('../utils/provider.exception.js');

const {
  generateHash,
  hashPassword,
  matchPassword,
  isStrongPassword,
  matchConfirmPassword,
  validateMissingFields,
  generateExpiredTimeByHour,
} = require('../services/user.js');

module.exports = {
  /*
   * @body name: 'example name'
   * @body email: 'example@gmail.com'
   * @body password: '1...8'
   */
  async signUp(request, response) {
    const {name, email, password} = request.body;

    try {
      validateMissingFields({name, email, password});

      const emailAlreadyRegistered = await Users.findOne({where: {email}});

      if (emailAlreadyRegistered)
        throw new ProvideException('email', 'Email já está em uso!');

      const isValidStrongPassword = isStrongPassword(password);

      if (!isValidStrongPassword) {
        throw new ProvideException('password', 'Senha vulnerável! Tente uma senha mais forte');
      }

      const userID = generateHash(5);
      const encryptedPassword = hashPassword(password);

      const user = await Users.create({
        id: userID, name, email,
        password: encryptedPassword,
      });

      return response.json({
        user,
        accessToken: generateToken({id: user.id}),
      });
    } catch ({message, field}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @body email: 'example@gmail.com'
   * @body password: '1...8'
   */
  async signIn(request, response) {
    const {email, password} = request.body;

    try {
      validateMissingFields({email, password});
      const emailRegistered = await Users.findOne({where: {email}});

      if (!emailRegistered)
        throw new ProvideException('email', 'Email não encontrado!');

      const isPasswordMatched = matchPassword({
        password,
        comparePassword: emailRegistered.password,
      });

      if (!isPasswordMatched)
        throw new ProvideException('password', 'Senha inválida!');

      /*
       * ID should be passed as params to validate different tokens
       */
      const token = generateToken({id: emailRegistered.id});

      const userResponse = await Users.findOne({
        where: {email},
        attributes: ['id', 'name', 'email', 'thumbnail'],
      });

      return response.json({token, user: userResponse});
    } catch ({message, field}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @query userID: '123...879'
   */
  async getUserProfile(request, response) {
    const {userID} = request.query;

    try {
      validateMissingFields({userID});

      const findUserById = await Users.findOne({
        where: {id: userID},
        attributes: ['id', 'name', 'email', 'thumbnail'],
      });

      if (!findUserById)
        throw new ProvideException('userId', 'ID de usuário inválido!');

      return response.json({user: findUserById});
    } catch ({message, field}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @body email: 'example@gmail.com'
   */
  async sendEmailToResetPassword(request, response) {
    const {email} = request.body;

    try {
      validateMissingFields({email});

      const findUserByEmail = await Users.findOne({where: {email}});

      if (!findUserByEmail)
        throw new ProvideException('email', 'Email não encontrado!');

      const accessToken = generateHash(20);
      const expiredTime = generateExpiredTimeByHour();

      const hasError = await sendEmail({
        accessToken,
        recipient: email,
        userName: findUserByEmail.name,
      });

      if (hasError)
        throw new ProvideException('email', 'Falha ao enviar o email!');

      await Users.update(
        {access_token: accessToken, expiredTime},
        {where: {email}},
      );

      return response.json({message: 'Email enviado com sucesso!'});
    } catch ({message, field}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @body password: '123...789'
   * @body confirmPassword: '123...789'
   *
   * @query accessToken: '#!#ijaddh12317...'
   */
  async updatePassword(request, response) {
    const {accessToken} = request.query;
    const {password, confirmPassword} = request.body;

    try {
      validateMissingFields({password, confirmPassword, accessToken});

      const passwordsMatch = matchConfirmPassword(password, confirmPassword);

      if (!passwordsMatch)
        throw new ProvideException('confirmPassword', 'Confirmação de senha inválida');

      const isAnValidAccessToken = await Users.findOne({where: {access_token: accessToken}});

      if (!isAnValidAccessToken)
        throw new ProvideException('accessToken', 'accessToken inválido');

      if (isAnValidAccessToken.expiredTime < new Date())
        throw new ProvideException('accessToken', 'accessToken expirado!');

      const encryptedPassword = hashPassword(password, 10);

      await Users.update(
        {
          expiredTime: null,
          accessToken: null,
          password: encryptedPassword,
        },
        {where: {access_token: accessToken}},
      );

      return response.json({message: 'Senha atualizada com sucesso'});
    } catch ({message, field}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @query userID: '#!#ijaddh12317...'
   */
  async getAboutUserEvents(request, response) {
    const {userID} = request.query;

    try {
      validateMissingFields({userID});

      const basicUserData = await Users.findOne({
        where: {id: userID},
        attributes: ['id', 'name', 'email', 'thumbnail'],
      });

      if (!basicUserData)
        throw new ProvideException('userID', 'userID não encontrado');

      const countDisclosuresEvents = await Events.count({
        where: {user_id: basicUserData.id},
      });

      const countCanceledEvents = await Events.count({
        where: {user_id: basicUserData.id, status: false},
      });

      return response.json({
        user: basicUserData,
        event: {
          canceled: countCanceledEvents,
          disclosures: countDisclosuresEvents,
        },
      });
    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @body name: 'example name'
   * @body email: 'example@gmail.com'
   *
   * @query userID: '#!#ijaddh12317...'
   */
  async updateUserProfile(request, response) {
    const {userID} = request.query;
    const {name, email} = request.body;

    try {
      validateMissingFields({name, email, userID});

      const emailAlreadyRegistered = await Users.findOne({
        where: {email, id: {[Op.ne]: userID}},
      });

      if (emailAlreadyRegistered)
        throw new ProvideException('email', 'Email já cadastrado');

      const isValidUser = await Users.findOne({where: {id: userID}});

      if (!isValidUser)
        throw new ProvideException('userID', 'userID inválido');

      await Users.update({name, email}, {where: {id: userID}});
      const user = await Users.findByPk(userID, {attributes: ['id', 'name', 'email', 'thumbnail']});

      return response.json({user});

    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },

  /*
   * @query userID: '#!#ijaddh12317...'
   * @body thumbnail: 'data:image/png;bas64,!@#2231h1...'
   */
  async updateUserThumbnail(request, response) {
    const {userID} = request.query;
    const {thumbnail} = request.body;

    try {
      validateMissingFields({userID, thumbnail});
      const isAnValidUser = await Users.findByPk(userID);

      if (!isAnValidUser) {
        throw new ProvideException('userID', 'userID inválido');
      }

      await Users.update({thumbnail: thumbnail || ''}, {where: {id: userID}});
      const user = await Users.findByPk(userID, {attributes: ['id', 'name', 'email', 'thumbnail']});

      return response.json({user});
    } catch ({field, message}) {
      return response.json({status: 'error', field, message});
    }
  },
};

