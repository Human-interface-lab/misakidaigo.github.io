// src/utils/logger.js

const LOG_KEY = 'clayConversationLogs';

/**
 * 로컬스토리지에 로그가 없으면 초기화
 */
function initLogs() {
  if (!localStorage.getItem(LOG_KEY)) {
    localStorage.setItem(LOG_KEY, JSON.stringify([]));
  }
}

/**
 * 일반 로그 (combine 등). noteId, action, prompt, response, timestamp를 저장
 */
export function logConversation(noteId, action, prompt, response) {
  initLogs();
  const logs = JSON.parse(localStorage.getItem(LOG_KEY));
  logs.push({
    noteId,
    action,
    prompt,
    response,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

/**
 * expand 전용 로그: action, response, timestamp만 저장
 */
export function logExpand(response) {
  initLogs();
  const logs = JSON.parse(localStorage.getItem(LOG_KEY));
  logs.push({
    action: 'expand',
    response,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

/**
 * 특정 noteId 관련 로그만 삭제
 */
export function removeLogsForNote(noteId) {
  initLogs();
  const logs = JSON.parse(localStorage.getItem(LOG_KEY));
  const filtered = logs.filter(log => log.noteId !== noteId);
  localStorage.setItem(LOG_KEY, JSON.stringify(filtered));
}

/**
 * 전체 로그 조회
 */
export function getLogs() {
  initLogs();
  return JSON.parse(localStorage.getItem(LOG_KEY));
}

/**
 * 로그 전부 삭제
 */
export function clearLogs() {
  localStorage.removeItem(LOG_KEY);
}
