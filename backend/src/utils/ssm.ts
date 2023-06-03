import { SSM } from '@aws-sdk/client-ssm';

const VERSION_KEY_PREFIX = 'DATA_ACTIVE_VERSION_';

const client = new SSM({ region: 'us-east-1' });

export const getCurrentVersion = async (type: string) => {
  const key = VERSION_KEY_PREFIX + type.toUpperCase();
  try {
    const { Parameter } = await client.getParameter({
      Name: key
    });
    return Parameter?.Value;
  } catch (e) {
    console.error('Error retrieving version from SSM', e);
    return null;
  }
};

export const setCurrentVersion = async (type: string, version: string) => {
  const key = VERSION_KEY_PREFIX + type.toUpperCase();
  try {
    const res = await client.putParameter({
      Name: key,
      Value: version,
      Overwrite: true
    });
    console.info(`Updated ${type} version`, res);
  } catch (e) {
    console.error(`Failed to update ${type} version`, e);
  }
};
