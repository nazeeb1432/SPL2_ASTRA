from typing import List,Annotated
from fastapi import APIRouter, Depends, HTTPException,Response,HTTPException,status
from ..import models,schemas,database,token,outh2
from sqlalchemy.orm import Session
from ..hashing import Hash
from fastapi.security import  OAuth2PasswordRequestForm


router=APIRouter(
    tags=['Authentication']
)

get_db=database.get_db




@router.post("/signup",response_model=schemas.ShowUser)
def signup(request:schemas.User,db:Session=Depends(get_db),response: Response = None):
    checkUser=db.query(models.User).filter(models.User.email==request.email).first()
    if checkUser:
        raise HTTPException(status_code=400,detail="User already exists")
    new_user=models.User(name=request.name,email=request.email,password=Hash.bcrypt(request.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate a token for the new user
    access_token = token.create_access_token(data={"sub": new_user.email})
    # Set cookies
    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,  # Prevent client-side JavaScript from accessing the cookie
        secure=True,     # Ensure cookies are only sent over HTTPS
        samesite="lax"   # Prevent CSRF attacks
    )
    response.set_cookie(
        key="email",
        value=new_user.email,
        httponly=False,  # Allow client-side JavaScript to access the email
        secure=True,
        samesite="lax"
    )
    return new_user


@router.post('/login')
def login(request:Annotated[OAuth2PasswordRequestForm, Depends()],db:Session =Depends(database.get_db),response: Response = None):
    user=db.query(models.User).filter(models.User.email == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Invalid credentials")
    if not Hash.verify(user.password,request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Incorrect password")
    #generate a jwt token and then return
   
    access_token = token.create_access_token(
        data={"sub": user.email}
    )
    # Set cookies
    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,  # Prevent client-side JavaScript from accessing the cookie
        secure=True,     # Ensure cookies are only sent over HTTPS
        samesite="lax"   # Prevent CSRF attacks
    )
    response.set_cookie(
        key="email",
        value=user.email,
        httponly=False,  # Allow client-side JavaScript to access the email
        secure=True,
        samesite="lax"
    )
    return {"access_token":access_token, "token_type":"bearer"}



@router.post("/logout")
def logout(response:Response):
     # Clear cookies
    response.delete_cookie("token")
    response.delete_cookie("email")
    return {"message": "Successfully logged out"}