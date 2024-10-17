class ApiError extends Error{
    constructor(
      statusCode,
      message="Something went wrong",
      errors=[],
      stack=""
    ){
        super(message)
        this.statusCode=statusCode
        this.data=null //read about it (this.data)
        this.message=message
        this.success=false
        this.errors=errors

        if(stack){
          this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }


    }
}

export {ApiError}
//read abt api error,what is stack for?
//read about all export statements way