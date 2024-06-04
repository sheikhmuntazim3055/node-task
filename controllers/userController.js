// import playersData from '../data/players.json' with {type:"json"}
import matchData from '../data/match.json' with {type:"json"}
import playerModel from '../models/playerModel.js';
import teamModel from '../models/teamModel.js';

const addTeam =async (req,res)=>{
    const {teamName,players,captain,viceCaptain}=req.body

    if (players.length!== 11) {
        return res.status(400).json({success:false,message:"A team must have exactly 11 players."})
    }

    try {
        const playerDetails =await playerModel.find({player:{$in:players}})
    console.log(playerDetails);

    const typeCount={"WICKETKEEPER":0,"BATTER":0,"ALL-ROUNDER":0,"BOWLER":0}
    const teamCount={ "Chennai Super Kings": 0,"Rajasthan Royals": 0 }

    playerDetails.forEach((player)=>{
        typeCount[player.role]++;
        teamCount[player.team]++
    })
    console.log(typeCount,teamCount);


    if (typeCount.WICKETKEEPER < 1 || typeCount.BATTER < 1 || typeCount['ALL-ROUNDER'] < 1 || typeCount.BOWLER < 1) {
        return res.status(400).json({
            success:false,
            message:"Each type of player must meet the minimum requirements."
        })
    }

    if (teamCount['Chennai Super Kings'] > 10 || teamCount['Rajasthan Royals'] > 10) {
        return res.status(400).json({
            success:false,
            message:"A maximum of 10 players can be selected from any one team."
        })
    }

    if (!players.includes(captain) || !players.includes(viceCaptain)) {
        return res.status(400).json({
            success:false,
            message:"Captain and vice-captain must be selected players."
        })
    }

    const team =new teamModel({
        teamName,
        players,
        captain,
        viceCaptain

    })

    await team.save()

    return res.status(201).json({
        success:true,
        message:"Team added successfully"
    })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
    
}


const calculatePoints =(player,events)=>{

    let points = 0;
    let runs = 0;
    let wickets = 0;
    let catches = 0;
    let stumpings = 0;
    let runOuts= 0 ;
    let ballsFaced = 0;
    let ballsBowled =0;
    let runsGiven =0;
    let overRuns={};


    events.forEach((event)=>{
        if (event.batter ===player) {
            runs += event.batsman_run;
            ballsFaced ++;
            if (event.batsman_run===4) points+=1; //boundry bonus
            if (event.batsman_run===6) points+=2; //six bonus
        }



        if (event.bowler===player) {
            ballsBowled++;
            runsGiven+=event.total_runs;

            if (!overRuns[event.overs]) {
                overRuns[event.overs] = 0;
            }
            overRuns[event.overs]+=event.total_runs

            if (event.isWicketDelivery && event.player_out !=='NA') {
             wickets++;
             points+=25 //Wicket
             if (event.kind ==="bowled"  || event.kind ==="lbw") points +=8; //bonus for lbw/bowled   
            }
        }

        if (event.fielders_involved.includes(player)) {
            if (event.kind==="caught") {
                catches++;
                points+=8  //catch
            }
            if (event.kind==="stumbed") {
                stumpings++;
                points+=12  //stumping
            }
            if (event.kind ==="run out") {
             runOuts++;
             points+=6;   
            }
        }
    })

    //Batting Bonus
    if (runs>=30)points+=4 ;
    if (runs>=50)points+=8 ;
    if (runs>=100)points+=16 ;
    if (runs ===0 && ballsFaced >0 && (player.role === "BATTER" || player.role ==="WICKETKEEPER" || player.role === "ALL-ROUNDER")) {
        points-=2;
    }

    //Bowling Bonus
    if (wickets >=3)points +=4 ;
    if (wickets >=4)points +=8 ;
    if (wickets >=5)points +=16 ;

    for (const over in overRuns) {
        if (overRuns[over ===0]) {
            points +=12;      //maiden over bonus
        }
    }

    //fielding Bonus
    if (catches >=3) points +=4;  //3 Catches Bouns

    return points
}


const processResult =async(req,res)=>{
    try {
        const teams =await teamModel.find()
        const players=await playerModel.find()
        console.log(teams)
        // console.log(matchData);

        const playerPointsMap ={}

        players.forEach(player=> {
            playerPointsMap[player.player]=calculatePoints(player.player,matchData)
        });

        //calculate total points for  each team
        for(let team of teams ){
            let totalPoints =0;
            team.players.forEach(player=>{
                let playerPoints =playerPointsMap[player];


                if (player ===team.captain) playerPoints*= 2 ;
                if (player ===team.viceCaptain)playerPoints*1.5 ;

                totalPoints += playerPoints
            })
            console.log(totalPoints,'tooysho');

            team.totalPoints=totalPoints
            await team.save();

        }
        return res.status(200).json({success:true,message:"Match results processed successfully"})

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


const teamResult =async(req,res)=>{
    try {
        const teams =await teamModel.find().sort({totalPoints:-1})
        console.log(teams);

        const maxPoints =teams.length ?teams[0].totalPoints :0;
        const winners =teams.filter(team=>team.totalPoints ===maxPoints)

        return res.status(200).json({success:true,
            teams,
            winners,
            message:"Match results "})
        
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

export {addTeam,processResult,teamResult}