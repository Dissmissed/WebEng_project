class Book < ActiveRecord::Base
  has_and_belongs_to_many :users
  has_many :chunks
  attr_accessible :abstract, :edition, :genre, :published, :tags, :title ,:user_ids
  validates :edition, :published, :title, :user_ids, presence: true

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
