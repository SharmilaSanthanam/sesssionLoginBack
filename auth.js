const isLogin = async(req,res,next)=>{
    try{
        if(req.session.id){}
            else{
                res.redirect('/');
            }
            next()
        }catch(error){
console.log(error.message);
        }
    }

    const isLogout = async(req,res,next)=>{
        try{
            if(req.session.id){
                
                    res.redirect('/userDetails');
                }
                next()
            }catch(error){
    console.log(error.message);
            }

    }
