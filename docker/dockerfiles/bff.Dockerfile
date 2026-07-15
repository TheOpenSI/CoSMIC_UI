# docker file for the backend for frontend -bff  for redirecting the login to keycloak and getting the tokens/cookies for the frontend.


FROM python:3.12-slim
WORKDIR /app
COPY ./backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt
COPY ./backend ./backend
EXPOSE 8081
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8081", "--reload"]