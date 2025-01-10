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
def signup(request:schemas.User,db:Session=Depends(get_db)):
    checkUser=db.query(models.User).filter(models.User.email==request.email).first()
    if checkUser:
        raise HTTPException(status_code=400,detail="User already exists")
    new_user=models.User(name=request.name,email=request.email,password=Hash.bcrypt(request.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post('/login')
def login(request:Annotated[OAuth2PasswordRequestForm, Depends()],db:Session =Depends(database.get_db)):
    user=db.query(models.User).filter(models.User.email == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Invalid credentials")
    if not Hash.verify(user.password,request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Incorrect password")
    #generate a jwt token and then return
   
    access_token = token.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token":access_token, "token_type":"bearer"}



@router.get("/logout")
def logout():
    pass