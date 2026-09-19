import pc from 'picocolors';

export default function checkNodeEnv(expectedEnv) {
  if (!expectedEnv) {
    throw new Error('"expectedEnv" not set');
  }

  if (process.env.NODE_ENV !== expectedEnv) {
    console.log(
      pc.whiteBright(
        pc.bgRed(
          pc.bold(`"process.env.NODE_ENV" must be "${expectedEnv}" to use this webpack config`)
        )
      )
    );
    process.exit(2);
  }
}
