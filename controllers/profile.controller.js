import { User, Follower } from '../models/index.js';
import _ from 'lodash';

export const getProfile = async (req, res) => {

    try {

        const userParam = req.params.username;
        const stateUserId = req.user.id;

        const profile = await User.findOne({
            where: { username: userParam },
        }); 

        const { username, image, bio, id } = profile;

        const follower = await Follower.findOne({
            where: {
                user_id: stateUserId,
                follow_id: id   
            }
        });

        console.log(follower);

        const isFollowed =  follower ? true : false;
          
        res.send({
            profile: {
                username,
                image,
                bio,
                following: isFollowed
            }
        });
        
    } catch (error) {
    
        console.log(error);
        res.status(400).send(error);
        
    }
}

export const followUser = async (req, res) => {

    try {

        const userId = req.user.id;
        const stateUser = req.user;
        const stateUsername = stateUser.username;
        const username = req.params.username;

        const follower = await User.findByUsername(username);

        if (follower.username !== stateUsername) {
            
            await Follower.create({
                user_id: userId,
                follow_id: follower.id,
            });

            const { username, bio, image } = stateUser;

            res.send({
                profile: {
                    username,
                    bio,
                    image,
                    following: true,
                }
            });

        } else {
            res.status(422).send({error: "Invalid request!"});
        }


        
    } catch (error) {
        console.log(error);
        res.status(400).send('Something went wrong!');
        
    }
}

export const unfollowUser = async(req, res) => {

    try {

        const profileId = req.user.id;
        const stateUsername = req.user.username;
        const username = req.params.username;
        const follower = await User.findByUsername(username);

        if (username !== stateUsername) {
            
            await Follower.destroy({
                where: {
                    user_id: profileId,
                    follow_id: follower.id
                }
            });

            res.send({
                message: `Profile ${username} unfollowed successfully.`
            })

        }

        
    } catch (error) {
        res.status(400).send(error); 
    }
}