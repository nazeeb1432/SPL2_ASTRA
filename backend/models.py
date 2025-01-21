from sqlalchemy import Column, Integer, String, Boolean, Text, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base


# User table
class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, unique=True, index=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="user")
    folders = relationship("Folder", back_populates="user")
    audiobooks = relationship("AudioBook", back_populates="user")
    settings = relationship("Settings", back_populates="user")
    otp = relationship("OTP", back_populates="user")


# Document table
class Document(Base):
    __tablename__ = "documents"
    document_id = Column(Integer, primary_key=True, index=True)
    is_scanned = Column(Boolean, nullable=False, default=False)
    title = Column(Text, nullable=False)
    user_id = Column(String, ForeignKey("users.email"), nullable=False)
    file_path = Column(String, nullable=False)
    progress = Column(Integer, default=0)  # Default progress is 0
    folder_id = Column(Integer, ForeignKey("folders.folder_id"), nullable=True)
    length = Column(Integer, nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")
    folder = relationship("Folder", back_populates="documents")
    bookmarks = relationship("Bookmark", back_populates="document")
    notes = relationship("Note", back_populates="document")
    audiobooks = relationship("AudioBook", back_populates="document")


# Folder table
class Folder(Base):
    __tablename__ = "folders"
    folder_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.email"), nullable=False)
    folder_name = Column(Text, nullable=False)
    parent = Column(Integer, ForeignKey("folders.folder_id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="folders")
    documents = relationship("Document", back_populates="folder")
    subfolders = relationship("Folder", backref="parent_folder", remote_side=[folder_id])


# Bookmark table
class Bookmark(Base):
    __tablename__ = "bookmarks"
    bookmark_id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.document_id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    document = relationship("Document", back_populates="bookmarks")


# AudioBook table
class AudioBook(Base):
    __tablename__ = "audiobooks"
    audiobook_id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.document_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.email"), nullable=False)
    voice_id = Column(Integer, ForeignKey("voices.voice_id"), nullable=False)
    progress = Column(Float, default=0.0)  # Default progress is 0
    duration = Column(Float, nullable=False)
    file_path = Column(String, nullable=False)

    # Relationships
    document = relationship("Document", back_populates="audiobooks")
    user = relationship("User", back_populates="audiobooks")
    voice = relationship("Voice", back_populates="audiobooks")


# Voices table
class Voice(Base):
    __tablename__ = "voices"
    voice_id = Column(Integer, primary_key=True, index=True)
    voice = Column(String, nullable=False)

    # Relationships
    audiobooks = relationship("AudioBook", back_populates="voice")


# Note table
class Note(Base):
    __tablename__ = "notes"
    note_id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.document_id"), nullable=False)
    note_title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    page = Column(Integer, nullable=False)

    # Relationships
    document = relationship("Document", back_populates="notes")


# Settings table
class Settings(Base):
    __tablename__ = "settings"
    user_id = Column(String, ForeignKey("users.email"), primary_key=True)
    speed = Column(Float, default=1.0)  # Default speed is 1.0
    streak_count = Column(Integer, default=0)
    last_login_date = Column(Date, nullable=True)
    page_goal = Column(Integer, nullable=True)
    duration_goal = Column(Float, nullable=True)
    voice_id = Column(Integer, ForeignKey("voices.voice_id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="settings")
    voice = relationship("Voice")


# OTP table
class OTP(Base):
    __tablename__ = "otp"
    user_id = Column(String, ForeignKey("users.email"), primary_key=True)
    code = Column(Integer, nullable=False)

    # Relationships
    user = relationship("User", back_populates="otp")
