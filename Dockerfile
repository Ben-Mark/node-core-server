FROM node:14.3.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies

# Bundle app source
COPY . /usr/src/app

RUN echo $(ls -la /usr/src/app)

ARG PORT_ARG
#ARG ENVIRONMENT
ENV PORT=${PORT_ARG}
#ENV CLIENT_NAME_ARG=$CLIENT_NAME
#ENV ENVIRONMENT_ARG=$ENVIRONMENT

#RUN echo "CLIENT_NAME: $CLIENT_NAME"
#RUN echo "CLIENT_NAME_ARG: $CLIENT_NAME_ARG"

EXPOSE ${PORT}
EXPOSE 9229

CMD [ "sh", "-c", "node --inspect=0.0.0.0:9229 ./bin/www" ]