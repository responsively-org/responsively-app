/*
  conflict handler methods for moveToApplication event on mac
  https://www.electronjs.org/docs/api/app#appmovetoapplicationsfolderoptions-macos
*/

// @flow

let conflictMessage = 'An app of this name already exists';
const moveFailedMessage = 'Something went wrong while moving application';

const confirmMove: boolean = dialog => {
  const response: number = dialog.showMessageBoxSync({
    type: 'error',
    message: 'Move to Applications folder?',
    detail:
      'Responsively App should be in the Applications folder to be able to work properly.',
    buttons: ['Move', 'Cancel'],
  });
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
