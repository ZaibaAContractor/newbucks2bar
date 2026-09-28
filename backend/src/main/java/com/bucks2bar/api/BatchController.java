package com.bucks2bar.api;

import com.bucks2bar.model.TrainingBatch;
import com.bucks2bar.repository.TrainingBatchRepository;
import java.util.List;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/batches")
@CrossOrigin(origins = "http://localhost:5173")
public class BatchController {
  private final TrainingBatchRepository batchRepository;

  public BatchController(TrainingBatchRepository batchRepository) {
    this.batchRepository = batchRepository;
  }

  @GetMapping
  public List<TrainingBatch> listBatches() {
    return batchRepository.findAllByOrderByNameAsc();
  }

  @PutMapping("/{id}")
  @Transactional
  public TrainingBatch updateDates(
      @PathVariable Long id,
      @RequestBody BatchDatesRequest request) {
    TrainingBatch batch = batchRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));
    batch.setStartDate(request.getStartDate());
    batch.setEndDate(request.getEndDate());
    return batch;
  }
}
