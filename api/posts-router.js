const express = require('express');


const db = require('../data/db');

const router = express.Router();

router.use(express.json());

router.post('/', (req,res)=>{
    const post = req.body;
    if(post.title && post.contents){
        db.insert(req.body)
            .then(data =>{
                res.status(201).json({...req.body, ...data});
            })
            .catch(error=>{
                res.status(500).json({ error: "There was an error while saving the post to the database" });
            })
    }else{
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    }
});

router.post('/:id/comments', (req,res)=>{
    const post = req.body;
    if(post.text && post.post_id){
        db.insertComment(req.body)
            .then(data =>{
                res.status(201).json({...req.body, ...data});
            })
            .catch(error=>{
                if(error.code === "SQLITE_CONSTRAINT"){
                    res.status(404).json({ message: "The post with the specified ID does not exist." })
                }else{
                    res.status(500).json({ error: "There was an error while saving the post to the database" });
                }
            })
    }else{
        res.status(400).json({ errorMessage: "Please provide test and post ID for the comment." });
    }
});

router.get('/:id', (req,res)=>{
    db.findById(req.params.id)
        .then(data=>{
            if(data[0]){
                res.status(200).json(data);
            }else{
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(error=>{
            console.log('/api/posts GET failed', error);
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});

router.get('/', (req,res)=>{
    db.find()
        .then(data=>{
            res.status(201).json(data);
        })
        .catch(error=>{
            console.log('/api/posts GET failed', error);
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});

router.get('/:id/comments', (req,res)=>{
    db.findPostComments(req.params.id)
        .then(data=>{
            if(data[0]){
                res.status(200).json(data);
            }else{
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(error=>{
            console.log('/api/posts GET failed', error);
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});

router.delete("/:id", (req,res)=>{
    db.remove(req.params.id)
        .then(data=>{
            if(data === 1){
                res.status(200).json({ message:"User was deleted successfully"});
            }else if (data === 0){
                res
                .status(404)
                .json({ message: "The user with the specified ID does not exist." }); 
            }
            
        })
        .catch(error=>{
            res.status(500).json({ error: "The post could not be removed" });
        });
});

router.put('/:id', (req,res)=>{
    const post = req.body;
    if(post.title && post.contents){
        db.update(req.params.id, post)
            .then(data=>{
                if(data===1){
                    return db.findById(req.params.id)
                        .then(data=>{
                            if(data[0]){
                                res.status(200).json(data);
                            }
                        })
                }else{
                    res.status(404).json({ message: "The post with the specified ID does not exist." });
                }
            })
            .catch(error=>{
                console.log('/api/posts GET failed', error);
                res.status(500).json({ error: "The posts information could not be retrieved." });
            });
    }else{
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    }
    
});



module.exports = router;