import type { DynamoDBStreamEvent } from 'aws-lambda';
import { UpdateCommandInput, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { docClient } from 'utils/ddb';

const COURSES_TABLE = process.env.COURSES_TABLE!;
console.assert(!!COURSES_TABLE, 'COURSES_TABLE is not defined in environment');

export default async (event: DynamoDBStreamEvent) => {
  const reviewIds: string[] = [];
  const qualityScoreDeltas: Record<string, number> = {};
  const layupScoreDeltas: Record<string, number> = {}

  // parse review updates
  event.Records.forEach(record => {
    const { NewImage, OldImage } = record.dynamodb ?? {};
    const id = (NewImage || OldImage)?.id.S;
    // either new or old image must be defined, alongside id;
    if (!(NewImage || OldImage) || !id) return;

    const oldQualityScore = parseInt(OldImage?.qualityScore?.N ?? '0');
    const oldLayupScore = parseInt(OldImage?.layupScore?.N ?? '0');
    const newQualityScore = parseInt(NewImage?.qualityScore?.N ?? '0');
    const newLayupScore = parseInt(NewImage?.layupScore?.N ?? '0');

    const qualityDelta = newQualityScore - oldQualityScore;
    const layupDelta = newLayupScore - oldLayupScore;

    reviewIds.push();
    qualityScoreDeltas[id] = (qualityScoreDeltas[id] ?? 0) + qualityDelta;
    layupScoreDeltas[id] = (layupScoreDeltas[id] ?? 0) + layupDelta;
  });

  // update course scores
  await Promise.all(reviewIds.map(async (id) => {
    const params: UpdateCommandInput = {
      TableName: COURSES_TABLE,
      Key: { id },
      ExpressionAttributeValues: {
        ':qualityScoreDelta': qualityScoreDeltas[id],
        ':layupScoreDelta': layupScoreDeltas[id]
      },
      UpdateExpression: `SET ${[
        'qualityScore = qualityScore + :qualityScoreDelta',
        'layupScore = layupScore + :layupScoreDelta'
      ].join(', ')}`
    };

    try {
      await docClient.send(new UpdateCommand(params));
    } catch (err) {
      console.trace(err);
    }
  }));
};
