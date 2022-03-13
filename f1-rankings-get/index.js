const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();
const DATABASE_NAME = 'f1_predictions';

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    const discordId = decodeURIComponent(event.pathParameters.discordId);

    const prediction = await getPrediction(discordId);
    let body = {};

    if (prediction) {
        const rankings = await getRankings(discordId);
        const specialDrivers = await getSpecialDrivers(prediction.dnf, prediction.overtake);
        
        body = {
            ...prediction,
            dnf: specialDrivers.dnf,
            overtake: specialDrivers.overtake,
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
    console.log(`Obtaining prediction record for ${discordId}`);
    const params = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: DATABASE_NAME,
        sql: `SELECT * FROM predictions
            WHERE discord=:discord`,
        parameters: [
            { name: 'discord', value: { stringValue: discordId } },
        ]
    }
    const result = await rdsDataService.executeStatement(params).promise();
    if (!result.records.length > 0) {
        console.log(`No prediction found for ${discordId}`);
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
    console.log(`Obtaining rankings for ${discordId}`);
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
        database: DATABASE_NAME,
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

async function getSpecialDrivers(dnf, overtake) {
    console.log(`Obtaining special selections for ${discordId}`);
    const params = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: DATABASE_NAME,
        sql: `SELECT * FROM drivers
            WHERE id in (:dnf, :overtake)`,
        parameters: [
            { name: 'dnf', value: { longValue: dnf } },
            { name: 'overtake', value: { longValue: overtake } },
        ]
    }
    const result = await rdsDataService.executeStatement(params).promise();
    const drivers = result.records.map((record) => parseDriver(record));
    const overtakeDriver = drivers.find((driver) => driver.id = overtake);
    const dnfDriver = drivers.find((driver) => driver.id = dnf);
    return {
        overtake: overtakeDriver,
        dnf: dnfDriver,
    }
}

function parseDriver(record) {
    return {
        'id': record[0].longValue,
        'name': record[1].stringValue,
        'team': record[2].stringValue,
        'rank': record[3].longValue,
        'country': record[4].stringValue,
    };
}