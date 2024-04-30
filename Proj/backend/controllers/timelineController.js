const Riak = require('basho-riak-client');
const moment = require('moment');

const node = new Riak.Node({ remoteAddress: '127.0.0.1', remotePort: 8087 });
const cluster = new Riak.Cluster({ nodes: [node] });
const client = new Riak.Client(cluster);

const { getUsersFollowingByUsername } = require('./userController');
const { getPostsByUsername } = require('./postController');

const calculatePopularityScore = (likes,age) => {
    return likes + (age * 10);
}

const getPostsMP = (username) => {
    return new Promise((resolve, reject) => {
        mapReduceQuery = {
            inputs: { bucket: username, key_filters: [['matches', 'post*']] },
            query: [
                {
                    map: {
                        language: 'erlang',
                        source: `
                            fun(RiakObject, _KeyData, _Arg) ->
                                {struct, Map} = mochijson2:decode(riak_object:get_value(RiakObject)),
                                NumLikes = proplists:get_value(<<"numLikes">>, Map),
                                PostDate = proplists:get_value(<<"postDate">>, Map),
                                [{<<"numLikes">>, NumLikes}, {<<"postDate">>, PostDate}]
                            end.
                        `
                    },
                },
                {
                    reduce: {
                        language: 'erlang',
                        source: `
                            fun(Values, _Arg) ->
                                TotalLikes 
                            end.
                        `
                    }
                }
            ]
        };

        var mapReduceString = JSON.stringify(mapReduceQuery);

        var curl = require('curlrequest');
        curl.request({ url: 'http://localhost:8098/mapred', method: 'POST', data: mapReduceString, headers: { 'Content-Type': 'application/json' } }, function (err, data) {
            if (err) {
                reject(err);
            }

            var result = JSON.parse(data);

            var numLikes = result[0];
            resolve(numLikes);
        });
    });
}

const getTimeline = async (username) => {
    try {
        const following = await getUsersFollowingByUsername(username);
        const posts = [];

        for (const followedUser of following) {
            const userPosts = await getPostsByUsername(followedUser);
            posts.push(...userPosts);
        }

        posts.sort((a, b) => b.popularityScore - a.popularityScore);
        
        return posts;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getTimeline
};