class Book < ActiveRecord::Base

  attr_accessible :title, :edition, :published, :genre, :abstract, :tags, :user_ids, :closed

  has_and_belongs_to_many :users
  has_many :chunks

  validates_presence_of :title, :edition, :users
  validates :edition, :uniqueness => {:scope => :title}

  before_destroy :destroy_chunks

  def sliced_attributes
    attributes.slice('title', 'genre', 'abstract', 'tags')
  end

  def published?
    !published.nil?
  end

  def has_chunks?
    !chunks.empty?
  end

  def max_chunk_position
    has_chunks? ? chunks.max_by(&:position).position : 0
  end

  def users_list
    users.collect { |u| u.username }.join(',')
  end

  def users_list_real_names
    users.collect { |u| u.first_name + ' ' + u.last_name }.join(',')
  end

  private
  def destroy_chunks
    chunks.each do |chunk|
      chunk.destroy
    end
  end

  def self.search(search)
    search_condition = "%" + search + "%"

    find(:all, :include => :users, :conditions => ['title LIKE ? OR edition LIKE ? OR published LIKE ? OR tags LIKE ? OR genre LIKE ? OR users.username LIKE ?', search_condition, search_condition, search_condition, search_condition, search_condition, search_condition])
  end

  def self.searchAdv(search)
    search_obj = JSON.parse(search)
    sql_strings = {
      :title => { :contains => "title LIKE ?", :contains_not => "title NOT LIKE ?" },
      :edition => { :eq => "edition = ?", :neq => "edition != ?", :lt => "edition < ?", :gt => "edition > ?" },
      :published => { :before => "published < ?", :after => "published > ?" },
      :genre => { :contains => "genre LIKE ?", :contains_not => "genre NOT LIKE ?"},
      :tags => { :contains => "tags LIKE ?", :contains_not => "tags NOT LIKE ?"},
      :autor => { :contains => "users.username LIKE ?", :contains_not => "users.username NOT LIKE ?"}
    }

    sql_query_string = "1=1"
    sql_query_vars = []

    search_obj.each { |col, val|
      val.each { |col2, val2|
        if !(val2.empty?)
          sql_query_string += " AND #{sql_strings[col.to_sym][col2.to_sym]}"
          if col == "edition"
            sql_query_vars.push("#{val2.to_i}")
          elsif col == "published"
            sql_query_vars.push("#{val2.to_date}")
          else
            sql_query_vars.push("%#{val2}%")
          end
        end
      }
    }

    sql_query_vars.insert(0, sql_query_string)

    find(:all, :include => :users, :conditions => sql_query_vars)
  #  find(:all, :conditions => ['title LIKE ? AND title NOT LIKE ?
  #                            AND edition = ? OR NULL AND edition != ? AND edition < ? AND edition > ?
  #                            AND published < ? AND published > ?
  #                            AND genre LIKE ? AND genre NOT LIKE ?
  #                            AND tags LIKE ? AND tags NOT LIKE?',
  #                            "%#{search_obj["title"]["contains"]}%", "%#{search_obj["title"]["contains_not"]}%",
  #                            "%#{search_obj["edition"]["eq"]}%", "%#{search_obj["edition"]["neq"]}%", "%#{search_obj["edition"]["lt"]}%", "%#{search_obj["edition"]["gt"]}%",
  #                            "%#{search_obj["published"]["before"]}%", "%#{search_obj["published"]["after"]}%",
  #                            "%#{search_obj["genre"]["contains"]}%", "%#{search_obj["genre"]["contains_not"]}%",
  #                            "%#{search_obj["tags"]["contains"]}%", "%#{search_obj["tags"]["contains_not"]}%"])
  end
end