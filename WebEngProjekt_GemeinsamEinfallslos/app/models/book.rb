class Book < ActiveRecord::Base
  has_and_belongs_to_many :users
  has_many :chunks
  attr_accessible :abstract, :edition, :genre, :published, :tags, :title ,:user_ids

  before_destroy :destroy_chunks

  def has_chunks?
    !chunks.empty?
  end

  def destroy_chunks
    chunks.each do |chunk|
      chunk.destroy
    end
  end
end
