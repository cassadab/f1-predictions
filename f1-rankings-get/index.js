const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    const discordId = decodeURIComponent(event.pathParameters.discordId);
    console.log(`Discord ID: ${discordId}`);

    const prediction = await getPrediction(discordId);
    let body = {};

    if (prediction) {
        const rankings = await getRankings(discordId);

        body = {
            ...prediction,
            rankings,
        };
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify(body),
    };

    return response;
};

async function getPrediction(discordId) {
    const params = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'f1_predictions',
        sql: `SELECT * FROM predictions
            WHERE discord=:discord`,
        parameters: [
            { name: 'discord', value: { stringValue: discordId } },
        ]
    }
    const result = await rdsDataService.executeStatement(params).promise();
    if (!result.records.length > 0) {
        return null;
    }
    return parsePrediction(result.records[0]);
}

function parsePrediction(record) {
    return {
        'discord_id': record[0].stringValue,
        'name': record[1].stringValue,
        'country': record[2].stringValue,
        'dnf': record[3].longValue,
        'overtake': record[4].longValue,
    };
}

async function getRankings(discordId) {
    const sqlParams = getRankingsSQLParams(discordId);
    const result = await rdsDataService.executeStatement(sqlParams).promise();
    return result.records.map((record) => parseRanking(record));
}

function parseRanking(record) {
    return {
        'prediction_rank': record[0].longValue,
        'driver_id': record[1].longValue,
        'name': record[2].stringValue,
        'team': record[3].stringValue,
        'rank': record[4].longValue || null,
        'country': record[5].stringValue,
    };
}

function getRankingsSQLParams(discord) {
    return {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'f1_predictions',
        sql: `SELECT r.rank as prediction_rank, r.driver, d.name, d.team, d.rank, d.country 
            FROM rankings r
            INNER JOIN drivers d
            ON r.driver=d.id
            WHERE prediction_id=:discord
            ORDER BY prediction_rank;`,
        parameters: [
            { name: 'discord', value: { stringValue: discord } },
        ]
    }
}
