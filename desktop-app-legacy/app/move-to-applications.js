/*
  conflict handler methods for moveToApplication event on mac
  https://www.electronjs.org/docs/api/app#appmovetoapplicationsfolderoptions-macos
*/

// @flow

import settings from 'electron-settings';
import {CAN_PROMPT_MOVE_TO_APPLICATIONS} from './constants/settingKeys';

let conflictMessage = 'An app of this name already exists';
const moveFailedMessage = 'Something went wrong while moving application';

const confirmMove: boolean = async dialog => {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }
  const canPrompt = settings.get(CAN_PROMPT_MOVE_TO_APPLICATIONS) ?? true;
  if (!canPrompt) {
    return false;
  }
  const {response, checkboxChecked} = await dialog.showMessageBox({
    type: 'error',
    message: 'Move to Applications folder?',
    detail:
      'Responsively App should be in the Applications folder to be able to work properly.',
    checkboxLabel: `Don't ask me again`,
    buttons: ['Move', 'Cancel'],
  });
  if (checkboxChecked) {
    settings.set(CAN_PROMPT_MOVE_TO_APPLICATIONS, false);
  }
  return response === 0;
};

const conflictHandler = (conflictType, dialog) => {
  if (conflictType === 'exists' || conflictType === 'existsAndRunning') {
    conflictMessage =
      conflictType === 'existsAndRunning'
        ? `${conflictMessage} and running`
        : conflictMessage;

    return (
      dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Halt Move', 'Continue Move'],
        defaultId: 0,
        message: conflictMessage,
      }) === 1
    );
  }
};

const movingFailed = dialog => {
  dialog.showMessageBoxSync({
    type: 'error',
    message: moveFailedMessage,
  });
};

export {conflictHandler, movingFailed, confirmMove};
