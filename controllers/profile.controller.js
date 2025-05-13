import User from '../models/user.model.js';
import Follower from '../models/follower.model.js';

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
                follower_id: follower.id
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

        }

        res.status(422).send({error: "Invalid request!"});

        
    } catch (error) {

        res.status(400).send(error);
        
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
                    follower_id: follower.id
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