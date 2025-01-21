from sqlalchemy import Column, Integer, String,ForeignKey
from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__="users"
    # id=Column(Integer,primary_key=True,index=True)
    email=Column(String,primary_key=True,unique=True,index=True)
    name=Column(String,nullable=False)
    password=Column(String,nullable=False)