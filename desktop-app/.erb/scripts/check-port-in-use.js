import pc from 'picocolors';
import detectPort from 'detect-port';

const port = process.env.PORT || '1212';

detectPort(port, (err, availablePort) => {
  if (port !== String(availablePort)) {
    throw new Error(
      pc.whiteBright(
        pc.bgRed(
          pc.bold(
            `Port "${port}" on "localhost" is already in use. Please use another port. ex: PORT=4343 yarn start`
          )
        )
      )
    );
  } else {
    process.exit(0);
  }
});
