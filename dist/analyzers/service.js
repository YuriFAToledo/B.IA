"use strict";
// main service
// entende as regras a serem atingidas - this
// entende quais criterios devem ser passados para as chamadas pro gemini - wcagService
// autentica repo e clona e identifica os path- githubService
// acessa os códigos - fileService
// faz as chamadas pro gemini - geminiService
// coleta e calcula quantas de quantas foram atingidas - this
// chama gemini de feedback, se necessário - geminiService
// chama os métodos do githubService para aprovar ou rejeitar o PR e escrever o comentário - githubService
// return
